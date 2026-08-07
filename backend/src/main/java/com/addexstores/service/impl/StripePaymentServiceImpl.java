package com.addexstores.service.impl;

import com.addexstores.dto.request.CreatePaymentRequest;
import com.addexstores.dto.request.RefundPaymentRequest;
import com.addexstores.dto.response.CreatePaymentResponse;
import com.addexstores.dto.response.CreateStripePaymentIntentResponse;
import com.addexstores.dto.response.PaymentStatusResponse;
import com.addexstores.dto.response.RefundResponse;
import com.addexstores.entity.*;
import com.addexstores.enums.OrderStatus;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.enums.PaymentStatus;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.exception.UnauthorizedException;
import com.addexstores.mapper.PaymentMapper;
import com.addexstores.repository.*;
import com.addexstores.payment.PaymentGateway;
import com.addexstores.service.CartService;
import com.addexstores.service.CurrencyService;
import com.addexstores.service.InventoryService;
import com.addexstores.service.NotificationService;
import com.addexstores.service.OrderService;
import com.addexstores.service.ShippingService;
import com.addexstores.service.StripePaymentService;
import com.addexstores.service.TaxService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements StripePaymentService, PaymentGateway {

    private static final Set<String> SUPPORTED_CURRENCIES = Set.of("USD", "EUR", "GBP", "AED", "INR", "AUD", "SAR", "CAD", "JPY");

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final NotificationService notificationService;
    private final CartService cartService;
    private final TaxService taxService;
    private final ShippingService shippingService;
    private final CurrencyService currencyService;
    private final OrderService orderService;
    private final InventoryService inventoryService;

    @Value("${payment.stripe.webhook-secret:}")
    private String webhookSecret;

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

        String targetCurrency = request.getCurrency() != null && !request.getCurrency().isBlank()
                ? request.getCurrency().trim().toUpperCase()
                : currencyService.getBaseCurrency();
        if (!SUPPORTED_CURRENCIES.contains(targetCurrency)) {
            throw new BadRequestException("Unsupported currency: " + targetCurrency + ". Supported: " + SUPPORTED_CURRENCIES);
        }

        BigDecimal tax = taxService.calculateTax(subtotal, request.getCountry(), request.getState());
        BigDecimal shippingCost = shippingService.calculateShipping(subtotal, request.getCountry());
        BigDecimal totalAmount = subtotal.add(tax).add(shippingCost);
        BigDecimal chargeAmount = currencyService.convertBaseCurrency(totalAmount, targetCurrency);

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .currency(currencyService.getBaseCurrency())
                .status(OrderStatus.PENDING_PAYMENT)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .paymentMethod("STRIPE")
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

        order.setItems(orderItems);
        inventoryService.reserveStock(cart.getItems());
        order = orderRepository.save(order);

        long stripeAmount = convertToSmallestUnit(chargeAmount, targetCurrency);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(stripeAmount)
                .setCurrency(targetCurrency.toLowerCase())
                .putMetadata("orderId", String.valueOf(order.getId()))
                .putMetadata("orderNumber", orderNumber)
                .putMetadata("customerId", String.valueOf(userId))
                .putMetadata("customerEmail", user.getEmail() != null ? user.getEmail() : "")
                .setDescription("AddexStores Order #" + orderNumber)
                .build();

        PaymentIntent paymentIntent;
        try {
            paymentIntent = PaymentIntent.create(params);
            log.info("Stripe PaymentIntent created: {} for order {}, amount {} {}",
                    paymentIntent.getId(), orderNumber, stripeAmount, targetCurrency);
        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new BadRequestException("Payment processing failed: " + e.getMessage());
        }

        Payment payment = Payment.builder()
                .userId(userId)
                .order(order)
                .amount(chargeAmount)
                .currency(targetCurrency)
                .baseAmount(totalAmount)
                .convertedAmount(chargeAmount)
                .paymentMethod(PaymentMethod.STRIPE)
                .status(PaymentStatus.PROCESSING)
                .stripePaymentIntentId(paymentIntent.getId())
                .gatewayOrderId(paymentIntent.getId())
                .gatewayResponse(paymentIntent.toJson())
                .customerEmail(user.getEmail())
                .build();
        payment = paymentRepository.save(payment);

        log.info("Payment record created: {} for user {} order {}",
                payment.getId(), userId, orderNumber);

        notificationService.createNotification(
                com.addexstores.dto.request.NotificationRequest.builder()
                        .userId(userId)
                        .type(com.addexstores.enums.NotificationType.ORDER_CONFIRMATION.name())
                        .title("Order Pending Payment")
                        .message("Your order #" + orderNumber + " is pending payment confirmation.")
                        .build());

        return CreatePaymentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentIntentId(paymentIntent.getId())
                .paymentId(payment.getId())
                .orderId(order.getId())
                .orderNumber(orderNumber)
                .currency(targetCurrency)
                .amount(stripeAmount)
                .status("PENDING_PAYMENT")
                .build();
    }

    @Override
    @Transactional
    public CreateStripePaymentIntentResponse createPaymentIntent(Long userId, Long orderId, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Order does not belong to this user");
        }

        String currencyUpper = (currency == null || currency.isBlank())
                ? currencyService.getBaseCurrency()
                : currency.trim().toUpperCase();
        if (!SUPPORTED_CURRENCIES.contains(currencyUpper)) {
            throw new BadRequestException("Unsupported currency: " + currency + ". Supported: " + SUPPORTED_CURRENCIES);
        }

        if (paymentRepository.existsByOrderIdAndStatusIn(orderId, List.of(PaymentStatus.PENDING, PaymentStatus.PROCESSING))) {
            throw new BadRequestException("An active payment already exists for this order");
        }

        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        if (existingPayment.isPresent() && !existingPayment.get().getCurrency().equalsIgnoreCase(currencyUpper)) {
            throw new BadRequestException("Currency mismatch with existing payment for this order");
        }

        BigDecimal appAmount = order.getTotalAmount();
        BigDecimal chargeAmount = currencyService.convertBaseCurrency(appAmount, currencyUpper);
        String stripeCurrency = currencyUpper.toLowerCase();

        long stripeAmount = convertToSmallestUnit(chargeAmount, currencyUpper);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(stripeAmount)
                .setCurrency(stripeCurrency)
                .putMetadata("orderId", String.valueOf(orderId))
                .putMetadata("customerId", String.valueOf(userId))
                .putMetadata("customerEmail", user.getEmail() != null ? user.getEmail() : "")
                .setDescription("AddexStores Order #" + order.getOrderNumber())
                .build();

        PaymentIntent paymentIntent;
        try {
            paymentIntent = PaymentIntent.create(params);
            log.info("Stripe PaymentIntent created: {} for order {}, amount {} {}",
                    paymentIntent.getId(), orderId, stripeAmount, stripeCurrency);
        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            throw new BadRequestException("Payment processing failed: " + e.getMessage());
        }

        Payment payment = Payment.builder()
                .userId(userId)
                .order(order)
                .amount(chargeAmount)
                .currency(currencyUpper)
                .baseAmount(appAmount)
                .convertedAmount(chargeAmount)
                .paymentMethod(PaymentMethod.STRIPE)
                .status(PaymentStatus.PROCESSING)
                .stripePaymentIntentId(paymentIntent.getId())
                .gatewayOrderId(paymentIntent.getId())
                .gatewayResponse(paymentIntent.toJson())
                .customerEmail(user.getEmail())
                .build();
        payment = paymentRepository.save(payment);

        log.info("Payment record created: {} for user {} order {}",
                payment.getId(), userId, orderId);

        return CreateStripePaymentIntentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentIntentId(paymentIntent.getId())
                .paymentId(payment.getId())
                .currency(currencyUpper)
                .amount(stripeAmount)
                .build();
    }

    @Override
    public PaymentStatusResponse retrievePayment(String stripePaymentIntentId) {
        return retrievePayment(stripePaymentIntentId, null);
    }

    @Override
    public PaymentStatusResponse retrievePayment(String stripePaymentIntentId, Long userId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "stripePaymentIntentId", stripePaymentIntentId));

        if (userId != null && !payment.getUserId().equals(userId)) {
            throw new UnauthorizedException("Payment does not belong to this user");
        }

        try {
            PaymentIntent pi = PaymentIntent.retrieve(stripePaymentIntentId);
            syncPaymentStatusFromStripe(payment, pi);
        } catch (StripeException e) {
            log.warn("Could not retrieve PaymentIntent from Stripe: {}", e.getMessage());
        }

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
    public void cancelPayment(String stripePaymentIntentId, Long userId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "stripePaymentIntentId", stripePaymentIntentId));

        if (!payment.getUserId().equals(userId)) {
            throw new UnauthorizedException("Payment does not belong to this user");
        }

        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new BadRequestException("Only pending payments can be cancelled");
        }

        try {
            PaymentIntent pi = PaymentIntent.retrieve(stripePaymentIntentId);
            pi.cancel();
            log.info("Stripe PaymentIntent cancelled: {}", stripePaymentIntentId);
        } catch (StripeException e) {
            log.error("Failed to cancel Stripe PaymentIntent: {}", e.getMessage());
            throw new BadRequestException("Failed to cancel payment: " + e.getMessage());
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        if (payment.getOrder() != null) {
            orderService.markOrderCancelled(payment.getOrder().getId(), userId, "Payment cancelled");
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

        if (payment.getStripePaymentIntentId() == null) {
            throw new BadRequestException("No Stripe PaymentIntent associated with this payment");
        }

        BigDecimal refundAmount = request.getAmount() != null
                ? request.getAmount()
                : payment.getAmount();

        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Refund amount must be positive");
        }
        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new BadRequestException("Refund amount exceeds payment amount");
        }

        long refundStripeAmount = convertToSmallestUnit(refundAmount, payment.getCurrency());

        BigDecimal totalRefunded = refundRepository.findByPaymentIdOrderByCreatedAtDesc(payment.getId())
                .stream()
                .filter(r -> "SUCCEEDED".equals(r.getStatus()))
                .map(Refund::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRefunded.add(refundAmount).compareTo(payment.getAmount()) > 0) {
            throw new BadRequestException("Refund amount exceeds payment amount");
        }

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(payment.getStripePaymentIntentId())
                .setAmount(refundStripeAmount)
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                .build();

        com.stripe.model.Refund stripeRefund;
        try {
            stripeRefund = com.stripe.model.Refund.create(params);
            log.info("Stripe refund created: {} for payment {} amount {}",
                    stripeRefund.getId(), payment.getId(), refundStripeAmount);
        } catch (StripeException e) {
            log.error("Stripe refund failed: {}", e.getMessage());
            throw new BadRequestException("Refund failed: " + e.getMessage());
        }

        com.addexstores.entity.Refund refundEntity = com.addexstores.entity.Refund.builder()
                .payment(payment)
                .refundId(stripeRefund.getId())
                .amount(refundAmount)
                .reason(request.getReason())
                .status(stripeRefund.getStatus().toUpperCase())
                .build();
        refundEntity = refundRepository.save(refundEntity);

        PaymentTransaction tx = PaymentTransaction.builder()
                .payment(payment)
                .transactionId(stripeRefund.getId())
                .gateway("STRIPE")
                .currency(payment.getCurrency())
                .amount(refundAmount.negate())
                .status(stripeRefund.getStatus().toUpperCase())
                .responsePayload(stripeRefund.toJson())
                .build();
        transactionRepository.save(tx);

        BigDecimal newTotalRefunded = totalRefunded.add(refundAmount);
        if (newTotalRefunded.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            if (payment.getOrder() != null) {
                orderService.markOrderRefunded(payment.getOrder().getId(), adminId, request.getReason());
            }
        }

        log.info("Refund processed for payment {} by admin {}: amount {} reason '{}'",
                payment.getId(), adminId, refundAmount, request.getReason());

        return PaymentMapper.toRefundResponse(refundEntity);
    }

    @Override
    public Event verifyWebhook(String payload, String signatureHeader) {
        if (webhookSecret.isBlank()) {
            log.error("Stripe webhook secret is not configured");
            throw new BadRequestException("Stripe webhook secret is not configured");
        }

        try {
            Event event = Webhook.constructEvent(payload, signatureHeader, webhookSecret);
            log.info("Stripe webhook verified: type={} id={}", event.getType(), event.getId());
            return event;
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed: {}", e.getMessage());
            throw new BadRequestException("Invalid webhook signature");
        }
    }

    @Override
    @Transactional
    public Payment processWebhookEvent(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = dataObjectDeserializer.getObject().orElse(null);
        if (stripeObject == null) {
            log.warn("Failed to deserialize webhook event object for event {}", event.getId());
            return null;
        }

        String eventType = event.getType();
        log.info("Processing webhook event: type={} id={}", eventType, event.getId());

        return switch (eventType) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(stripeObject);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(stripeObject);
            case "charge.refunded" -> handleChargeRefunded(stripeObject);
            case "charge.dispute.created" -> handleDisputeCreated(stripeObject);
            default -> {
                log.debug("Unhandled webhook event type: {}", eventType);
                yield null;
            }
        };
    }

    private Payment handlePaymentIntentSucceeded(StripeObject stripeObject) {
        PaymentIntent pi = (PaymentIntent) stripeObject;
        Payment payment = paymentRepository.findByStripePaymentIntentId(pi.getId()).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for PaymentIntent: {}", pi.getId());
            return null;
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already completed for PaymentIntent: {}", pi.getId());
            return payment;
        }

        long expectedAmount = convertToSmallestUnit(payment.getAmount(), payment.getCurrency());
        boolean amountMismatch = pi.getAmount() == null || pi.getAmount().longValue() != expectedAmount;
        boolean currencyMismatch = pi.getCurrency() == null
                || !pi.getCurrency().equalsIgnoreCase(payment.getCurrency());
        if (amountMismatch || currencyMismatch) {
            log.error("Payment amount/currency mismatch for PaymentIntent {}: charged {} {}, expected {} {}",
                    pi.getId(), pi.getAmount(), pi.getCurrency(), expectedAmount, payment.getCurrency());
            return null;
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayPaymentId(pi.getLatestCharge());
        payment.setGatewayResponse(pi.toJson());
        paymentRepository.save(payment);

        if (payment.getOrder() != null) {
            Order order = payment.getOrder();
            if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);
            }

            User orderUser = order.getUser();
            if (orderUser != null) {
                cartRepository.findByUserId(orderUser.getId()).ifPresent(cart -> {
                    cart.getItems().clear();
                    cartRepository.save(cart);
                    log.info("Cart cleared for user {} after successful payment", orderUser.getId());
                });
            }
        }

        String chargeId = pi.getLatestCharge() != null ? pi.getLatestCharge() : pi.getId();
        if (!transactionRepository.existsByPaymentIdAndTransactionIdAndGateway(
                payment.getId(), chargeId, "STRIPE")) {
            PaymentTransaction tx = PaymentTransaction.builder()
                    .payment(payment)
                    .transactionId(chargeId)
                    .gateway("STRIPE")
                    .currency(payment.getCurrency())
                    .amount(payment.getAmount())
                    .status("SUCCEEDED")
                    .responsePayload(pi.toJson())
                    .build();
            transactionRepository.save(tx);
        }

        log.info("Payment succeeded for PaymentIntent: {} order: {}",
                pi.getId(), payment.getOrder() != null ? payment.getOrder().getOrderNumber() : "N/A");
        return payment;
    }

    private Payment handlePaymentIntentFailed(StripeObject stripeObject) {
        PaymentIntent pi = (PaymentIntent) stripeObject;
        Payment payment = paymentRepository.findByStripePaymentIntentId(pi.getId()).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for failed PaymentIntent: {}", pi.getId());
            return null;
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setGatewayResponse(pi.toJson());
        paymentRepository.save(payment);

        if (!transactionRepository.existsByPaymentIdAndTransactionIdAndGateway(
                payment.getId(), pi.getId(), "STRIPE")) {
            PaymentTransaction tx = PaymentTransaction.builder()
                    .payment(payment)
                    .transactionId(pi.getId())
                    .gateway("STRIPE")
                    .currency(payment.getCurrency())
                    .amount(payment.getAmount())
                    .status("FAILED")
                    .responsePayload(pi.toJson())
                    .build();
            transactionRepository.save(tx);
        }

        log.info("Payment failed for PaymentIntent: {}", pi.getId());
        return payment;
    }

    private Payment handleChargeRefunded(StripeObject stripeObject) {
        com.stripe.model.Charge charge = (com.stripe.model.Charge) stripeObject;
        String paymentIntentId = charge.getPaymentIntent();
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for refunded PaymentIntent: {}", paymentIntentId);
            return null;
        }

        if (!transactionRepository.existsByPaymentIdAndTransactionIdAndGateway(
                payment.getId(), charge.getId(), "STRIPE")) {
            PaymentTransaction tx = PaymentTransaction.builder()
                    .payment(payment)
                    .transactionId(charge.getId())
                    .gateway("STRIPE")
                    .currency(payment.getCurrency())
                    .amount(charge.getAmountRefunded() != null
                            ? BigDecimal.valueOf(charge.getAmountRefunded()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                            : payment.getAmount())
                    .status("REFUNDED")
                    .responsePayload(charge.toJson())
                    .build();
            transactionRepository.save(tx);
        }

        BigDecimal amountRefunded = charge.getAmountRefunded() != null
                ? BigDecimal.valueOf(charge.getAmountRefunded()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : payment.getAmount();
        if (amountRefunded.compareTo(payment.getAmount()) >= 0 && payment.getStatus() != PaymentStatus.REFUNDED) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            if (payment.getOrder() != null) {
                orderService.markOrderRefunded(payment.getOrder().getId(), null, "Refunded via Stripe");
            }
        }

        log.info("Charge refunded for PaymentIntent: {}", paymentIntentId);
        return payment;
    }

    private Payment handleDisputeCreated(StripeObject stripeObject) {
        com.stripe.model.Charge charge = findChargeFromDispute(stripeObject);
        if (charge == null) return null;

        String paymentIntentId = charge.getPaymentIntent();
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId).orElse(null);
        if (payment == null) {
            log.warn("Payment not found for disputed PaymentIntent: {}", paymentIntentId);
            return null;
        }

        log.warn("Dispute created for payment {} PaymentIntent {}",
                payment.getId(), paymentIntentId);
        return payment;
    }

    private com.stripe.model.Charge findChargeFromDispute(StripeObject stripeObject) {
        try {
            com.stripe.model.Dispute dispute = (com.stripe.model.Dispute) stripeObject;
            String chargeId = dispute.getCharge();
            if (chargeId != null) {
                return com.stripe.model.Charge.retrieve(chargeId);
            }
        } catch (Exception e) {
            log.warn("Could not retrieve charge from dispute: {}", e.getMessage());
        }
        return null;
    }

    private void syncPaymentStatusFromStripe(Payment payment, PaymentIntent pi) {
        String stripeStatus = pi.getStatus();
        PaymentStatus newStatus = payment.getStatus();

        switch (stripeStatus) {
            case "succeeded" -> newStatus = PaymentStatus.COMPLETED;
            case "canceled" -> newStatus = PaymentStatus.CANCELLED;
            case "processing" -> newStatus = PaymentStatus.PROCESSING;
            case "requires_payment_method" -> newStatus = PaymentStatus.PENDING;
        }

        if (newStatus != payment.getStatus()) {
            payment.setStatus(newStatus);
            payment.setGatewayResponse(pi.toJson());
            paymentRepository.save(payment);

            if (newStatus == PaymentStatus.COMPLETED && payment.getOrder() != null) {
                Order order = payment.getOrder();
                if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    order.setStatus(OrderStatus.PROCESSING);
                    orderRepository.save(order);
                    log.info("Order {} status updated to PROCESSING via payment sync", order.getOrderNumber());
                }
            } else if (newStatus == PaymentStatus.CANCELLED && payment.getOrder() != null) {
                orderService.markOrderCancelled(payment.getOrder().getId(), payment.getUserId(), "Payment cancelled by gateway");
            }
        }
    }

    @Override
    public String getGatewayName() {
        return "STRIPE";
    }

    private long convertToSmallestUnit(BigDecimal amount, String currency) {
        String cur = currency.toUpperCase();
        if (!SUPPORTED_CURRENCIES.contains(cur)) {
            throw new BadRequestException("Unsupported currency: " + currency);
        }
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }
}
