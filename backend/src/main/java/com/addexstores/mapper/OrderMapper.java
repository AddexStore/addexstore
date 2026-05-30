package com.addexstores.mapper;

import com.addexstores.dto.response.OrderItemResponse;
import com.addexstores.dto.response.OrderResponse;
import com.addexstores.entity.Order;
import com.addexstores.entity.OrderItem;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    private static class ShippingAddressMapper {
        static OrderResponse.ShippingAddress toShippingAddress(Order order) {
            if (order == null) return null;
            return OrderResponse.ShippingAddress.builder()
                    .street(order.getStreet())
                    .city(order.getCity())
                    .state(order.getState())
                    .zip(order.getZipCode())
                    .country(order.getCountry())
                    .build();
        }
    }

    public static OrderResponse toOrderResponse(Order order) {
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
                .status(order.getStatus())
                .shippingAddress(ShippingAddressMapper.toShippingAddress(order))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems() != null
                        ? order.getItems().stream()
                            .map(OrderMapper::toOrderItemResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public static OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    public static List<OrderResponse> toOrderResponseList(List<Order> orders) {
        if (orders == null) return Collections.emptyList();
        return orders.stream()
                .map(OrderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }
}
