package com.addexstores.repository;

import com.addexstores.entity.OrderItem;
import com.addexstores.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalQty " +
           "FROM OrderItem oi GROUP BY oi.product.id ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalQty " +
           "FROM OrderItem oi WHERE oi.order.status IN :statuses " +
           "GROUP BY oi.product.id, oi.product.name ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProductsByStatuses(@Param("statuses") Collection<OrderStatus> statuses);
}
