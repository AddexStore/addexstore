package com.addexstores.controller.admin;

import com.addexstores.dto.response.AdminPaymentResponse;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.PaymentTransactionResponse;
import com.addexstores.dto.response.RefundResponse;
import com.addexstores.dto.request.RefundPaymentRequest;
import com.addexstores.entity.Payment;
import com.addexstores.entity.PaymentTransaction;
import com.addexstores.entity.Refund;
import com.addexstores.enums.PaymentStatus;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.PaymentMapper;
import com.addexstores.repository.PaymentRepository;
import com.addexstores.repository.PaymentTransactionRepository;
import com.addexstores.repository.RefundRepository;
import com.addexstores.enums.PaymentMethod;
import com.addexstores.payment.PaymentGateway;
import com.addexstores.payment.PaymentGatewayFactory;
import com.addexstores.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin Payments")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final PaymentGatewayFactory gatewayFactory;

    @GetMapping
    @Operation(summary = "Get all payments with search and filter")
    public ApiResponse<PagedResponse<AdminPaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Payment> paymentPage;

        if (search != null && !search.isBlank()) {
            paymentPage = paymentRepository.searchWithOrder(search, pageRequest);
        } else if (status != null && !status.isBlank()) {
            paymentPage = paymentRepository.findByStatusWithOrder(PaymentStatus.valueOf(status.toUpperCase()), pageRequest);
        } else {
            paymentPage = paymentRepository.findAllWithOrder(pageRequest);
        }

        List<AdminPaymentResponse> responses = paymentPage.getContent().stream()
                .map(PaymentMapper::toAdminResponse)
                .collect(Collectors.toList());

        PagedResponse<AdminPaymentResponse> paged = PagedResponse.<AdminPaymentResponse>builder()
                .content(responses)
                .page(paymentPage.getNumber())
                .size(paymentPage.getSize())
                .totalElements(paymentPage.getTotalElements())
                .totalPages(paymentPage.getTotalPages())
                .last(paymentPage.isLast())
                .build();

        return ApiResponse.success(paged);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details with transactions and refunds")
    public ApiResponse<AdminPaymentResponse> getPayment(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));

        List<PaymentTransaction> transactions = transactionRepository.findByPaymentIdOrderByCreatedAtDesc(id);
        List<Refund> refunds = refundRepository.findByPaymentIdOrderByCreatedAtDesc(id);

        return ApiResponse.success(PaymentMapper.toAdminResponse(payment, transactions, refunds));
    }

    @GetMapping("/{id}/transactions")
    @Operation(summary = "Get payment transaction history")
    public ApiResponse<List<PaymentTransactionResponse>> getPaymentTransactions(@PathVariable Long id) {
        List<PaymentTransaction> transactions = transactionRepository.findByPaymentIdOrderByCreatedAtDesc(id);
        List<PaymentTransactionResponse> responses = transactions.stream()
                .map(PaymentMapper::toTransactionResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(responses);
    }

    @GetMapping("/{id}/refunds")
    @Operation(summary = "Get payment refund history")
    public ApiResponse<List<RefundResponse>> getPaymentRefunds(@PathVariable Long id) {
        List<Refund> refunds = refundRepository.findByPaymentIdOrderByCreatedAtDesc(id);
        List<RefundResponse> responses = refunds.stream()
                .map(PaymentMapper::toRefundResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(responses);
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Refund a payment (full or partial)")
    public ApiResponse<RefundResponse> refundPayment(
            @CurrentUser Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody RefundPaymentRequest request) {
        request.setPaymentId(id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
        PaymentGateway gateway = gatewayFactory.getGateway(payment.getPaymentMethod());
        return ApiResponse.success(gateway.refundPayment(adminId, request));
    }

    @PostMapping("/refund")
    @Operation(summary = "Refund a payment by payment ID in body")
    public ApiResponse<RefundResponse> refundPaymentBody(
            @CurrentUser Long adminId,
            @Valid @RequestBody RefundPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getPaymentId()));
        PaymentGateway gateway = gatewayFactory.getGateway(payment.getPaymentMethod());
        return ApiResponse.success(gateway.refundPayment(adminId, request));
    }
}
