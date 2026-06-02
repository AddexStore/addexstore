package com.addexstores.service.impl;

import com.addexstores.dto.request.OrderRequest;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.entity.*;
import com.addexstores.enums.NotificationType;
import com.addexstores.enums.OrderStatus;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.OrderMapper;
import com.addexstores.repository.*;
import com.addexstores.service.NotificationService;
import com.addexstores.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

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

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.085"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("9.99");

        BigDecimal totalAmount = subtotal.add(tax).add(shippingCost);

        String orderNumber = "ORD-" + System.currentTimeMillis() + (int)(Math.random() * 90 + 10);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
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

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
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

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

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
        return OrderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<OrderResponse> content = OrderMapper.toOrderResponseList(orders.getContent());
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
            throw new com.addexstores.exception.UnauthorizedException("Order does not belong to this user");
        }
        return OrderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new com.addexstores.exception.UnauthorizedException("Order does not belong to this user");
        }
        return OrderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orders;
        if (status != null && !status.isBlank()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByStatus(orderStatus, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        List<OrderResponse> content = OrderMapper.toOrderResponseList(orders.getContent());
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
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(orderStatus);
        order = orderRepository.save(order);

        if (orderStatus == OrderStatus.DELIVERED) {
            notificationService.createNotification(
                    com.addexstores.dto.request.NotificationRequest.builder()
                            .userId(order.getUser().getId())
                            .type(NotificationType.DELIVERY_CONFIRMATION.name())
                            .title("Order Delivered")
                            .message("Your order #" + order.getOrderNumber() + " has been delivered.")
                            .build());
        } else if (orderStatus == OrderStatus.SHIPPED) {
            notificationService.createNotification(
                    com.addexstores.dto.request.NotificationRequest.builder()
                            .userId(order.getUser().getId())
                            .type(NotificationType.SHIPPING_UPDATE.name())
                            .title("Order Shipped")
                            .message("Your order #" + order.getOrderNumber() + " has been shipped.")
                            .build());
        } else if (orderStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        log.info("Order {} status updated to {}", order.getOrderNumber(), status);
        return OrderMapper.toOrderResponse(order);
    }
}
