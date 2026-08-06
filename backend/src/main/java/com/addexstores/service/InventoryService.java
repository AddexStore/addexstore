package com.addexstores.service;

import com.addexstores.entity.CartItem;
import com.addexstores.entity.Order;

import java.util.List;

public interface InventoryService {

    void reserveStock(List<CartItem> items);

    void releaseStock(Order order);
}
