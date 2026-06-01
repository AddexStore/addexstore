package com.addexstores.service;

import com.addexstores.dto.request.OrderRequest;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.dto.response.PagedResponse;

public interface OrderService {

    OrderResponse createOrder(Long userId, OrderRequest request);

    PagedResponse<OrderResponse> getUserOrders(Long userId, int page, int size);

    OrderResponse getOrderById(Long userId, Long id);

    OrderResponse getOrderByOrderNumber(Long userId, String orderNumber);

    PagedResponse<OrderResponse> getAllOrders(int page, int size, String status);

    OrderResponse updateOrderStatus(Long id, String status);
}
