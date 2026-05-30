package com.addexstores.controller.admin;

import com.addexstores.dto.response.ApiResponse;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders")
    public ApiResponse<PagedResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(orderService.getAllOrders(page, size, status));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body) {
        return ApiResponse.success(orderService.updateOrderStatus(id, body.get("status")));
    }
}
