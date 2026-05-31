package com.addexstores.service.impl;

import com.addexstores.dto.request.CapturePayPalRequest;
import com.addexstores.dto.request.CreatePayPalOrderRequest;
import com.addexstores.dto.request.CreateRazorpayOrderRequest;
import com.addexstores.dto.request.NotificationRequest;
import com.addexstores.dto.request.VerifyRazorpayRequest;
import com.addexstores.dto.response.PaymentResponse;
import com.addexstores.entity.*;
import com.addexstores.enums.NotificationType;
import com.addexstores.enums.OrderStatus;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.enums.PaymentStatus;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.repository.CartRepository;
import com.addexstores.repository.OrderRepository;
import com.addexstores.repository.PaymentRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.UserRepository;
import com.addexstores.service.NotificationService;
import com.addexstores.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    @Value("${payment.paypal.client-id:}")
    private String paypalClientId;

    @Value("${payment.paypal.client-secret:}")
    private String paypalClientSecret;

    @Value("${payment.paypal.mode:sandbox}")
    private String paypalMode;

    @Value("${payment.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${payment.razorpay.key-secret:}")
    private String razorpayKeySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            if (!razorpayKeyId.isBlank() && !razorpayKeySecret.isBlank()) {
                razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                log.info("Razorpay client initialized");
            }
        } catch (Exception e) {
            log.warn("Razorpay client not initialized (keys not configured): {}", e.getMessage());
        }
    }

    private String getPaypalBaseUrl() {
        return "sandbox".equalsIgnoreCase(paypalMode)
                ? "https://api-m.sandbox.paypal.com"
                : "https://api-m.paypal.com";
    }

    private String getPaypalAccessToken() {
        if (paypalClientId.isBlank() || paypalClientSecret.isBlank()) {
            return "mock-token";
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(paypalClientId, paypalClientSecret);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String body = "grant_type=client_credentials";
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    getPaypalBaseUrl() + "/v1/oauth2/token",
                    request, Map.class);

            if (response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to get PayPal access token: {}", e.getMessage());
        }
        return "mock-token";
    }

    @Override
    @Transactional
    public PaymentResponse createPayPalOrder(Long userId, CreatePayPalOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = getCart(userId);
        BigDecimal totalAmount = calculateTotal(cart);

        Payment payment = Payment.builder()
                .userId(userId)
                .amount(totalAmount)
                .currency("USD")
                .paymentMethod(PaymentMethod.PAYPAL)
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        if (paypalClientId.isBlank() || paypalClientSecret.isBlank()) {
            String mockOrderId = "MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            payment.setGatewayOrderId(mockOrderId);
            payment.setGatewayResponse("{\"mode\":\"simulated\"}");
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .id(payment.getId())
                    .amount(totalAmount)
                    .currency("USD")
                    .paymentMethod(PaymentMethod.PAYPAL)
                    .status(PaymentStatus.PENDING)
                    .gatewayOrderId(mockOrderId)
                    .approvalUrl(null)
                    .createdAt(payment.getCreatedAt())
                    .build();
        }

        try {
            String accessToken = getPaypalAccessToken();
            if ("mock-token".equals(accessToken)) {
                throw new BadRequestException("PayPal is not configured. Please use COD or Razorpay.");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> orderRequest = new HashMap<>();
            orderRequest.put("intent", "CAPTURE");

            Map<String, Object> amountMap = new HashMap<>();
            amountMap.put("currency_code", "USD");
            amountMap.put("value", totalAmount.setScale(2, RoundingMode.HALF_UP).toString());

            List<Map<String, Object>> purchaseUnits = new ArrayList<>();
            Map<String, Object> unit = new HashMap<>();
            unit.put("amount", amountMap);
            unit.put("description", "AddexStores Order");
            purchaseUnits.add(unit);
            orderRequest.put("purchase_units", purchaseUnits);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(orderRequest, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    getPaypalBaseUrl() + "/v2/checkout/orders",
                    entity, Map.class);

            if (response.getBody() != null) {
                String paypalOrderId = (String) response.getBody().get("id");
                payment.setGatewayOrderId(paypalOrderId);
                payment.setGatewayResponse(response.getBody().toString());
                paymentRepository.save(payment);

                String approvalUrl = null;
                List<Map<String, String>> links = (List<Map<String, String>>) response.getBody().get("links");
                if (links != null) {
                    for (Map<String, String> link : links) {
                        if ("approve".equals(link.get("rel"))) {
                            approvalUrl = link.get("href");
                            break;
                        }
                    }
                }

                return PaymentResponse.builder()
                        .id(payment.getId())
                        .amount(totalAmount)
                        .currency("USD")
                        .paymentMethod(PaymentMethod.PAYPAL)
                        .status(PaymentStatus.PENDING)
                        .gatewayOrderId(paypalOrderId)
                        .approvalUrl(approvalUrl)
                        .createdAt(payment.getCreatedAt())
                        .build();
            }
        } catch (Exception e) {
            log.error("PayPal create order failed: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse("{\"error\":\"" + e.getMessage() + "\"}");
            paymentRepository.save(payment);
            throw new BadRequestException("PayPal payment failed: " + e.getMessage());
        }

        throw new BadRequestException("Failed to create PayPal order");
    }

    @Override
    @Transactional
    public PaymentResponse capturePayPalOrder(Long userId, CapturePayPalRequest request) {
        Payment payment = paymentRepository.findByGatewayOrderId(request.getPaypalOrderId())
                .orElseThrow(() -> new BadRequestException("PayPal order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment already processed");
        }

        if ("mock-token".equals(getPaypalAccessToken()) && request.getPaypalOrderId().startsWith("MOCK_")) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setGatewayPaymentId("MOCK_PAYMENT_" + UUID.randomUUID().toString().substring(0, 8));
            payment.setGatewayResponse("{\"mode\":\"simulated\",\"status\":\"COMPLETED\"}");
            paymentRepository.save(payment);

            Order order = createOrderFromCart(userId, user, PaymentMethod.PAYPAL, request.getStreet(),
                    request.getCity(), request.getState(), request.getZipCode(),
                    request.getCountry(), request.getNotes(), payment);

            return buildPaymentResponse(payment, order);
        }

        try {
            String accessToken = getPaypalAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    getPaypalBaseUrl() + "/v2/checkout/orders/" + request.getPaypalOrderId() + "/capture",
                    entity, Map.class);

            if (response.getBody() != null) {
                String status = (String) response.getBody().get("status");
                if ("COMPLETED".equals(status)) {
                    payment.setStatus(PaymentStatus.COMPLETED);

                    List<Map<String, Object>> purchaseUnits = (List<Map<String, Object>>) response.getBody().get("purchase_units");
                    if (purchaseUnits != null && !purchaseUnits.isEmpty()) {
                        List<Map<String, Object>> captures = (List<Map<String, Object>>) purchaseUnits.get(0).get("captures");
                        if (captures != null && !captures.isEmpty()) {
                            payment.setGatewayPaymentId((String) captures.get(0).get("id"));
                        }
                    }

                    payment.setGatewayResponse(response.getBody().toString());
                    paymentRepository.save(payment);

                    Order order = createOrderFromCart(userId, user, PaymentMethod.PAYPAL, request.getStreet(),
                            request.getCity(), request.getState(), request.getZipCode(),
                            request.getCountry(), request.getNotes(), payment);

                    return buildPaymentResponse(payment, order);
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setGatewayResponse(response.getBody().toString());
                    paymentRepository.save(payment);
                    throw new BadRequestException("PayPal payment not completed. Status: " + status);
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("PayPal capture failed: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse("{\"error\":\"" + e.getMessage() + "\"}");
            paymentRepository.save(payment);
            throw new BadRequestException("PayPal capture failed: " + e.getMessage());
        }

        throw new BadRequestException("Failed to capture PayPal order");
    }

    @Override
    @Transactional
    public PaymentResponse createRazorpayOrder(Long userId, CreateRazorpayOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = getCart(userId);
        BigDecimal totalAmount = calculateTotal(cart);

        Payment payment = Payment.builder()
                .userId(userId)
                .amount(totalAmount)
                .currency("INR")
                .paymentMethod(PaymentMethod.RAZORPAY)
                .status(PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        if (razorpayClient == null) {
            String mockOrderId = "order_MOCK_" + UUID.randomUUID().toString().substring(0, 8);
            payment.setGatewayOrderId(mockOrderId);
            payment.setGatewayResponse("{\"mode\":\"simulated\"}");
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .id(payment.getId())
                    .amount(totalAmount)
                    .currency("INR")
                    .paymentMethod(PaymentMethod.RAZORPAY)
                    .status(PaymentStatus.PENDING)
                    .gatewayOrderId(mockOrderId)
                    .createdAt(payment.getCreatedAt())
                    .build();
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).longValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + payment.getId());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            payment.setGatewayOrderId(razorpayOrderId);
            payment.setGatewayResponse(razorpayOrder.toString());
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .id(payment.getId())
                    .amount(totalAmount)
                    .currency("INR")
                    .paymentMethod(PaymentMethod.RAZORPAY)
                    .status(PaymentStatus.PENDING)
                    .gatewayOrderId(razorpayOrderId)
                    .createdAt(payment.getCreatedAt())
                    .build();
        } catch (RazorpayException e) {
            log.error("Razorpay create order failed: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Razorpay payment failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyRazorpayPayment(Long userId, VerifyRazorpayRequest request) {
        Payment payment = paymentRepository.findByGatewayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new BadRequestException("Razorpay order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment already processed");
        }

        boolean verified = false;

        if (request.getRazorpayOrderId().startsWith("order_MOCK_")) {
            verified = true;
        } else {
            verified = verifyRazorpaySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
        }

        if (verified) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setGatewayPaymentId(request.getRazorpayPaymentId());
            payment.setGatewayResponse("{\"razorpay_payment_id\":\"" + request.getRazorpayPaymentId()
                    + "\",\"razorpay_order_id\":\"" + request.getRazorpayOrderId() + "\"}");
            paymentRepository.save(payment);

            Order order = createOrderFromCart(userId, user, PaymentMethod.RAZORPAY, request.getStreet(),
                    request.getCity(), request.getState(), request.getZipCode(),
                    request.getCountry(), request.getNotes(), payment);

            return buildPaymentResponse(payment, order);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Razorpay signature verification failed");
        }
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", String.valueOf(orderId)));
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Razorpay signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private Cart getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        return cart;
    }

    private BigDecimal calculateTotal(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.085"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("9.99");

        return subtotal.add(tax).add(shippingCost);
    }

    private Order createOrderFromCart(Long userId, User user, PaymentMethod paymentMethod,
                                       String street, String city, String state,
                                       String zipCode, String country, String notes,
                                       Payment payment) {
        Cart cart = getCart(userId);

        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.085"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("9.99");

        BigDecimal totalAmount = subtotal.add(tax).add(shippingCost);

        String orderNumber = "ORD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .status(OrderStatus.PROCESSING)
                .street(street)
                .city(city)
                .state(state)
                .zipCode(zipCode)
                .country(country)
                .paymentMethod(paymentMethod.name())
                .notes(notes)
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

        payment.setOrder(order);
        paymentRepository.save(payment);

        cart.getItems().clear();
        cartRepository.save(cart);

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(userId)
                        .type(NotificationType.ORDER_CONFIRMATION.name())
                        .title("Order Confirmed")
                        .message("Your order #" + orderNumber + " has been placed and payment received.")
                        .build());

        log.info("Order created with payment: {} for user {}", orderNumber, userId);
        return order;
    }

    private PaymentResponse buildPaymentResponse(Payment payment, Order order) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
