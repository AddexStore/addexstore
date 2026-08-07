package com.addexstores.service.impl;

import com.addexstores.dto.request.OrderRequest;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.entity.*;
import com.addexstores.enums.NotificationType;
import com.addexstores.enums.OrderStatus;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.exception.UnauthorizedException;
import com.addexstores.mapper.OrderMapper;
import com.addexstores.repository.*;
import com.addexstores.service.NotificationService;
import com.addexstores.service.OrderService;
import com.addexstores.service.TaxService;
import com.addexstores.service.ShippingService;
import com.addexstores.service.InventoryService;
import com.addexstores.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Set<OrderStatus> STOCK_HOLDING_STATUSES = EnumSet.of(
            OrderStatus.PENDING,
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED);

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TaxService taxService;
    private final ShippingService shippingService;
    private final InventoryService inventoryService;
    private final CurrencyService currencyService;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = taxService.calculateTax(subtotal, request.getCountry(), request.getState());
        BigDecimal shippingCost = shippingService.calculateShipping(subtotal, request.getCountry());
        BigDecimal totalAmount = subtotal.add(tax).add(shippingCost);
        String currency = request.getCurrency() != null && !request.getCurrency().isBlank()
                ? request.getCurrency().trim().toUpperCase()
                : currencyService.getBaseCurrency();

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .currency(currency)
                .status(OrderStatus.PENDING)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product == null || product.getId() == null) {
                throw new BadRequestException("A product in your cart is no longer available");
            }

            String image = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                image = product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .map(ProductImage::getImageUrl)
                        .orElse(product.getImages().get(0).getImageUrl());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImage(image)
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .subtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();

            orderItems.add(orderItem);
        }

        inventoryService.reserveStock(cart.getItems());

        order.setItems(orderItems);
        order = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        notificationService.createNotification(
                com.addexstores.dto.request.NotificationRequest.builder()
                        .userId(userId)
                        .type(NotificationType.ORDER_CONFIRMATION.name())
                        .title("Order Confirmed")
                        .message("Your order #" + orderNumber + " has been placed successfully.")
                        .build());

        log.info("Order created: {} for user {}", orderNumber, userId);
        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<OrderResponse> content = orderMapper.toOrderResponseList(orders.getContent());
        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .first(orders.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Order does not belong to this user");
        }
        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Order does not belong to this user");
        }
        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        OrderStatus orderStatus = parseStatus(status);
        String query = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Order> orders;
        if (orderStatus != null && query != null) {
            orders = orderRepository.searchByStatus(orderStatus, query, pageable);
        } else if (orderStatus != null) {
            orders = orderRepository.findByStatus(orderStatus, pageable);
        } else if (query != null) {
            orders = orderRepository.search(query, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        List<OrderResponse> content = orderMapper.toOrderResponseList(orders.getContent());
        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .first(orders.isFirst())
                .build();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = findOrder(id);
        OrderStatus target = parseStatus(status);
        if (target == null) {
            throw new BadRequestException("Order status is required");
        }
        return applyTransition(order, target, null, null, "Admin");
    }

    @Override
    @Transactional
    public OrderResponse markOrderCancelled(Long orderId, Long actorId, String reason) {
        Order order = findOrder(orderId);
        return applyTransition(order, OrderStatus.CANCELLED, actorId, reason, "System");
    }

    @Override
    @Transactional
    public OrderResponse markOrderRefunded(Long orderId, Long actorId, String reason) {
        Order order = findOrder(orderId);
        return applyTransition(order, OrderStatus.REFUNDED, actorId, reason, "System");
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private OrderResponse applyTransition(Order order, OrderStatus target, Long actorId, String reason, String triggeredBy) {
        OrderStatus current = order.getStatus();
        if (current == target) {
            throw new BadRequestException("Order " + order.getOrderNumber() + " is already " + current);
        }
        if (!canTransition(current, target)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + target);
        }

        if ((target == OrderStatus.CANCELLED || target == OrderStatus.REFUNDED)
                && STOCK_HOLDING_STATUSES.contains(current)) {
            inventoryService.releaseStock(order);
        }

        order.setStatus(target);
        order = orderRepository.save(order);

        sendStatusNotification(order, target, triggeredBy);

        log.info("Order {} status {} -> {} (triggered by {})",
                order.getOrderNumber(), current, target, triggeredBy);
        return orderMapper.toOrderResponse(order);
    }

    private boolean canTransition(OrderStatus from, OrderStatus to) {
        if (from == null || to == null) {
            return false;
        }
        return switch (from) {
            case PENDING -> to == OrderStatus.PENDING_PAYMENT
                    || to == OrderStatus.PROCESSING
                    || to == OrderStatus.CANCELLED;
            case PENDING_PAYMENT -> to == OrderStatus.PROCESSING
                    || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED
                    || to == OrderStatus.CANCELLED
                    || to == OrderStatus.REFUNDED;
            case SHIPPED -> to == OrderStatus.DELIVERED
                    || to == OrderStatus.CANCELLED
                    || to == OrderStatus.REFUNDED;
            case DELIVERED -> to == OrderStatus.REFUNDED;
            default -> false;
        };
    }

    private OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }
    }

    private void sendStatusNotification(Order order, OrderStatus status, String triggeredBy) {
        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        if (userId == null) {
            return;
        }

        NotificationType type;
        String title;
        String message;
        switch (status) {
            case SHIPPED -> {
                type = NotificationType.SHIPPING_UPDATE;
                title = "Order Shipped";
                message = "Your order #" + order.getOrderNumber() + " has been shipped.";
            }
            case DELIVERED -> {
                type = NotificationType.DELIVERY_CONFIRMATION;
                title = "Order Delivered";
                message = "Your order #" + order.getOrderNumber() + " has been delivered.";
            }
            case CANCELLED -> {
                type = NotificationType.ORDER_CANCELLATION;
                title = "Order Cancelled";
                message = "Your order #" + order.getOrderNumber() + " has been cancelled.";
            }
            case REFUNDED -> {
                type = NotificationType.REFUND_CONFIRMATION;
                title = "Order Refunded";
                message = "Your order #" + order.getOrderNumber() + " has been refunded.";
            }
            default -> {
                log.debug("No notification for status {}", status);
                return;
            }
        }

        notificationService.createNotification(
                com.addexstores.dto.request.NotificationRequest.builder()
                        .userId(userId)
                        .type(type.name())
                        .title(title)
                        .message(message)
                        .build());
    }
}
