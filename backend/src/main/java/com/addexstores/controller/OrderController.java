package com.addexstores.controller;

import com.addexstores.dto.request.OrderRequest;
import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.security.CurrentUser;
import com.addexstores.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create new order")
    public ApiResponse<OrderResponse> createOrder(@CurrentUser Long userId,
                                                   @Valid @RequestBody OrderRequest request) {
        return ApiResponse.success(orderService.createOrder(userId, request));
    }

    @GetMapping
    @Operation(summary = "Get user orders")
    public ApiResponse<PagedResponse<OrderResponse>> getUserOrders(@CurrentUser Long userId,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(orderService.getUserOrders(userId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ApiResponse<OrderResponse> getOrderById(@CurrentUser Long userId,
                                                    @PathVariable Long id) {
        return ApiResponse.success(orderService.getOrderById(userId, id));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ApiResponse<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        return ApiResponse.success(orderService.getOrderByOrderNumber(orderNumber));
    }
}
