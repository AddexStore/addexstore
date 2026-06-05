package com.addexstores.service.impl;

import com.addexstores.config.RazorpayConfig;
import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.request.NotificationRequest;
import com.addexstores.dto.request.RefundPaymentRequest;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.dto.response.RefundResponse;
import com.addexstores.entity.*;
import com.addexstores.enums.NotificationType;
import com.addexstores.enums.OrderStatus;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.enums.PaymentStatus;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.PaymentGatewayException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.PaymentMapper;
import com.addexstores.payment.PaymentGateway;
import com.addexstores.repository.*;
import com.addexstores.service.CurrencyService;
import com.addexstores.service.NotificationService;
import com.addexstores.service.ShippingService;
import com.addexstores.service.TaxService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayPaymentServiceImpl implements PaymentGateway {

    private final RazorpayConfig razorpayConfig;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final TaxService taxService;
    private final ShippingService shippingService;
    private final CurrencyService currencyService;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        String keyId = razorpayConfig.getKeyId();
        String keySecret = razorpayConfig.getKeySecret();
        if (!keyId.isBlank() && !keySecret.isBlank()) {
            try {
                razorpayClient = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                log.error("Failed to initialize Razorpay client: {}", e.getMessage());
            }
        }
    }

    @Override
    public String getGatewayName() {
        return "RAZORPAY";
    }

    @Override
    @Transactional
    public CreatePaymentResponse createOrderAndPaymentIntent(Long userId, CreatePaymentRequest request) {
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

        String targetCurrency = request.getCurrency() != null ? request.getCurrency().toUpperCase() : "INR";
        BigDecimal subtotalInUsd = currencyService.convertToUsd(subtotal, targetCurrency);
        BigDecimal tax = taxService.calculateTax(subtotalInUsd, request.getCountry(), request.getState());
        BigDecimal shippingCost = shippingService.calculateShipping(subtotalInUsd, request.getCountry());
        BigDecimal totalInUsd = subtotalInUsd.add(tax).add(shippingCost);
        BigDecimal totalAmount = currencyService.convertFromUsd(totalInUsd, targetCurrency);

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal taxInTarget = currencyService.convertFromUsd(tax, targetCurrency);
        BigDecimal shippingInTarget = currencyService.convertFromUsd(shippingCost, targetCurrency);

        com.addexstores.entity.Order dbOrder = com.addexstores.entity.Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(subtotal)
                .tax(taxInTarget)
                .shippingCost(shippingInTarget)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING_PAYMENT)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .paymentMethod("RAZORPAY")
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
                    .order(dbOrder)
                    .product(product)
                    .productName(product.getName())
                    .productImage(image)
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .subtotal(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            orderItems.add(orderItem);
        }

        dbOrder.setItems(orderItems);
        dbOrder = orderRepository.save(dbOrder);

        long amountInPaise = totalAmount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP).longValue();

        String razorpayOrderId;
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", targetCurrency);
            orderRequest.put("receipt", orderNumber);
            JSONObject notes = new JSONObject();
            notes.put("orderId", dbOrder.getId().toString());
            notes.put("customerId", userId.toString());
            orderRequest.put("notes", notes);

            com.razorpay.Order razorpaySdkOrder = razorpayClient.orders.create(orderRequest);
            razorpayOrderId = razorpaySdkOrder.get("id");
            log.info("Razorpay order created: {} for order {}, amount {} {}", razorpayOrderId, orderNumber, amountInPaise, targetCurrency);
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            dbOrder.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(dbOrder);
            throw new PaymentGatewayException("Payment processing failed: " + e.getMessage());
        }

        Payment payment = Payment.builder()
                .userId(userId)
                .order(dbOrder)
                .amount(totalAmount)
                .currency(targetCurrency)
                .baseAmount(totalAmount)
                .paymentMethod(PaymentMethod.RAZORPAY)
                .status(PaymentStatus.PROCESSING)
                .gatewayOrderId(razorpayOrderId)
                .customerEmail(user.getEmail())
                .build();
        payment = paymentRepository.save(payment);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(userId)
                        .type(NotificationType.ORDER_CONFIRMATION.name())
                        .title("Order Pending Payment")
                        .message("Your order #" + orderNumber + " is pending payment confirmation.")
                        .build());

        return CreatePaymentResponse.builder()
                .clientSecret(razorpayOrderId)
                .paymentIntentId(razorpayOrderId)
                .paymentId(payment.getId())
                .orderId(dbOrder.getId())
                .orderNumber(orderNumber)
                .currency(targetCurrency)
                .amount(amountInPaise)
                .status("PENDING_PAYMENT")
                .build();
    }

    @Override
    public PaymentStatusResponse retrievePayment(String razorpayPaymentId) {
        Payment payment = paymentRepository.findByGatewayOrderId(razorpayPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "gatewayOrderId", razorpayPaymentId));
        return PaymentMapper.toStatusResponse(payment);
    }

    @Override
    public PaymentStatusResponse retrievePaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", String.valueOf(orderId)));
        return PaymentMapper.toStatusResponse(payment);
    }

    @Override
    @Transactional
    public void cancelPayment(String razorpayPaymentId, Long userId) {
        Payment payment = paymentRepository.findByGatewayOrderId(razorpayPaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "gatewayOrderId", razorpayPaymentId));

        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new BadRequestException("Only pending payments can be cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        if (payment.getOrder() != null) {
            com.addexstores.entity.Order dbOrder = payment.getOrder();
            dbOrder.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(dbOrder);
        }
    }

    @Override
    @Transactional
    public RefundResponse refundPayment(Long adminId, RefundPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getPaymentId()));

        if (payment.getStatus() != PaymentStatus.COMPLETED && payment.getStatus() != PaymentStatus.REFUNDED) {
            throw new BadRequestException("Only completed payments can be refunded");
        }

        if (payment.getGatewayOrderId() == null) {
            throw new BadRequestException("No Razorpay payment ID associated with this payment");
        }

        BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : payment.getAmount();

        BigDecimal totalRefunded = refundRepository.findByPaymentIdOrderByCreatedAtDesc(payment.getId())
                .stream()
                .filter(r -> "SUCCEEDED".equals(r.getStatus()))
                .map(com.addexstores.entity.Refund::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRefunded.add(refundAmount).compareTo(payment.getAmount()) > 0) {
            throw new BadRequestException("Refund amount exceeds payment amount");
        }

        long refundAmountPaise = refundAmount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP).longValue();

        com.razorpay.Refund razorpayRefund;
        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", refundAmountPaise);
            refundRequest.put("speed", "normal");
            refundRequest.put("notes", new JSONObject().put("reason", request.getReason() != null ? request.getReason() : ""));
            razorpayRefund = razorpayClient.payments.refund(payment.getGatewayOrderId(), refundRequest);
            log.info("Razorpay refund created: {} for payment {} amount {}", razorpayRefund.get("id"), payment.getId(), refundAmountPaise);
        } catch (RazorpayException e) {
            log.error("Razorpay refund failed: {}", e.getMessage());
            throw new PaymentGatewayException("Refund failed: " + e.getMessage());
        }

        com.addexstores.entity.Refund refundEntity = com.addexstores.entity.Refund.builder()
                .payment(payment)
                .refundId(razorpayRefund.get("id"))
                .amount(refundAmount)
                .reason(request.getReason())
                .status("SUCCEEDED")
                .build();
        refundEntity = refundRepository.save(refundEntity);

        PaymentTransaction tx = PaymentTransaction.builder()
                .payment(payment)
                .transactionId(razorpayRefund.get("id"))
                .gateway("RAZORPAY")
                .currency(payment.getCurrency())
                .amount(refundAmount.negate())
                .status("SUCCEEDED")
                .responsePayload(razorpayRefund.toString())
                .build();
        transactionRepository.save(tx);

        BigDecimal newTotalRefunded = totalRefunded.add(refundAmount);
        if (newTotalRefunded.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            if (payment.getOrder() != null) {
                com.addexstores.entity.Order dbOrder = payment.getOrder();
                dbOrder.setStatus(OrderStatus.REFUNDED);
                orderRepository.save(dbOrder);
            }
        }

        log.info("Refund processed for payment {} by admin {}: amount {} reason '{}'",
                payment.getId(), adminId, refundAmount, request.getReason());

        return PaymentMapper.toRefundResponse(refundEntity);
    }

    public JSONObject verifyWebhook(String payload, String signatureHeader, String webhookSecret) {
        try {
            boolean verified = Utils.verifyWebhookSignature(payload, signatureHeader, webhookSecret);
            if (!verified) {
                log.error("Razorpay webhook signature verification failed");
                throw new PaymentGatewayException("Invalid webhook signature");
            }
            JSONObject event = new JSONObject(payload);
            log.info("Razorpay webhook verified: type={}", event.get("event"));
            return event;
        } catch (RazorpayException e) {
            log.error("Razorpay webhook verification failed: {}", e.getMessage());
            throw new PaymentGatewayException("Invalid webhook signature");
        }
    }

    public JSONObject verifyWebhook(String payload, String signatureHeader) {
        return verifyWebhook(payload, signatureHeader, razorpayConfig.getWebhookSecret());
    }

    @Transactional
    public Payment processWebhookEvent(JSONObject event) {
        String eventType = event.getString("event");

        return switch (eventType) {
            case "payment.captured" -> handlePaymentCaptured(event);
            case "payment.failed" -> handlePaymentFailed(event);
            case "refund.created" -> handleRefundCreated(event);
            default -> {
                log.debug("Unhandled Razorpay webhook event type: {}", eventType);
                yield null;
            }
        };
    }

    private Payment handlePaymentCaptured(JSONObject event) {
        JSONObject payload = event.getJSONObject("payload");
        JSONObject paymentObj = payload.getJSONObject("payment").getJSONObject("entity");
        String razorpayPaymentId = paymentObj.getString("id");
        String razorpayOrderId = paymentObj.getString("order_id");

        Payment payment = paymentRepository.findByGatewayOrderId(razorpayOrderId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for Razorpay order: {}", razorpayOrderId);
            return null;
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already completed for Razorpay order: {}", razorpayOrderId);
            return payment;
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayPaymentId(razorpayPaymentId);
        payment.setGatewayResponse(paymentObj.toString());
        paymentRepository.save(payment);

        if (payment.getOrder() != null) {
            com.addexstores.entity.Order dbOrder = payment.getOrder();
            dbOrder.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(dbOrder);

            User orderUser = dbOrder.getUser();
            if (orderUser != null) {
                cartRepository.findByUserId(orderUser.getId()).ifPresent(cart -> {
                    cart.getItems().clear();
                    cartRepository.save(cart);
                    log.info("Cart cleared for user {} after successful Razorpay payment", orderUser.getId());
                });
            }
        }

        PaymentTransaction tx = PaymentTransaction.builder()
                .payment(payment)
                .transactionId(razorpayPaymentId)
                .gateway("RAZORPAY")
                .currency(payment.getCurrency())
                .amount(payment.getAmount())
                .status("SUCCEEDED")
                .responsePayload(paymentObj.toString())
                .build();
        transactionRepository.save(tx);

        log.info("Razorpay payment captured: {} for order {}", razorpayPaymentId,
                payment.getOrder() != null ? payment.getOrder().getOrderNumber() : "N/A");
        return payment;
    }

    private Payment handlePaymentFailed(JSONObject event) {
        JSONObject payload = event.getJSONObject("payload");
        JSONObject paymentObj = payload.getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentObj.optString("order_id", "");

        Payment payment = paymentRepository.findByGatewayOrderId(razorpayOrderId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for failed Razorpay order: {}", razorpayOrderId);
            return null;
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setGatewayResponse(paymentObj.toString());
        paymentRepository.save(payment);

        PaymentTransaction tx = PaymentTransaction.builder()
                .payment(payment)
                .transactionId(paymentObj.optString("id", ""))
                .gateway("RAZORPAY")
                .currency(payment.getCurrency())
                .amount(payment.getAmount())
                .status("FAILED")
                .responsePayload(paymentObj.toString())
                .build();
        transactionRepository.save(tx);

        log.info("Razorpay payment failed for order: {}", razorpayOrderId);
        return payment;
    }

    private Payment handleRefundCreated(JSONObject event) {
        JSONObject payload = event.getJSONObject("payload");
        JSONObject refundObj = payload.getJSONObject("refund").getJSONObject("entity");
        String razorpayPaymentId = refundObj.optString("payment_id", "");

        Payment payment = paymentRepository.findByGatewayPaymentId(razorpayPaymentId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for refunded Razorpay payment: {}", razorpayPaymentId);
            return null;
        }

        PaymentTransaction tx = PaymentTransaction.builder()
                .payment(payment)
                .transactionId(refundObj.optString("id", ""))
                .gateway("RAZORPAY")
                .currency(payment.getCurrency())
                .amount(refundObj.has("amount") ? BigDecimal.valueOf(refundObj.getLong("amount")).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP) : payment.getAmount())
                .status("REFUNDED")
                .responsePayload(refundObj.toString())
                .build();
        transactionRepository.save(tx);

        log.info("Razorpay refund created for payment: {}", razorpayPaymentId);
        return payment;
    }
}
