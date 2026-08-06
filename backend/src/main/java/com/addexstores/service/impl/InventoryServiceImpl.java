package com.addexstores.service.impl;

import com.addexstores.entity.CartItem;
import com.addexstores.entity.Order;
import com.addexstores.entity.OrderItem;
import com.addexstores.entity.Product;
import com.addexstores.exception.BadRequestException;
import com.addexstores.repository.ProductRepository;
import com.addexstores.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void reserveStock(List<CartItem> items) {
        if (items == null) {
            return;
        }
        for (CartItem item : items) {
            if (item.getQuantity() <= 0) {
                throw new BadRequestException("Invalid quantity for cart item");
            }
            Product product = item.getProduct();
            if (product == null || product.getId() == null) {
                throw new BadRequestException("Product is no longer available");
            }
            int updated = productRepository.decrementStock(product.getId(), item.getQuantity());
            if (updated == 0) {
                log.warn("Insufficient stock for product {} requested {}", product.getId(), item.getQuantity());
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
        }
    }

    @Override
    @Transactional
    public void releaseStock(Order order) {
        if (order == null || order.getItems() == null) {
            return;
        }
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() == null || item.getProduct().getId() == null) {
                continue;
            }
            int updated = productRepository.incrementStock(item.getProduct().getId(), item.getQuantity());
            if (updated == 0) {
                log.warn("Could not restore stock for product {} on order {}",
                        item.getProduct().getId(), order.getOrderNumber());
            }
        }
    }
}
