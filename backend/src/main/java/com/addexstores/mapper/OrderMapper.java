package com.addexstores.mapper;

import com.addexstores.dto.response.OrderItemResponse;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.entity.Order;
import com.addexstores.entity.OrderItem;
import com.addexstores.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final FileUploadService fileUploadService;

    public OrderResponse toOrderResponse(Order order) {
        if (order == null) return null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .shippingAddress(toShippingAddress(order))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems() != null
                        ? order.getItems().stream()
                            .map(this::toOrderItemResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productImage(fileUploadService.getFileUrl(item.getProductImage()))
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private OrderResponse.ShippingAddress toShippingAddress(Order order) {
        if (order == null) return null;
        return OrderResponse.ShippingAddress.builder()
                .street(order.getStreet())
                .city(order.getCity())
                .state(order.getState())
                .zip(order.getZipCode())
                .country(order.getCountry())
                .build();
    }

    public List<OrderResponse> toOrderResponseList(List<Order> orders) {
        if (orders == null) return Collections.emptyList();
        return orders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }
}
