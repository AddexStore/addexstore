package com.addexstores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shipping_rules")
public class ShippingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(precision = 10, scale = 2)
    private BigDecimal freeShippingThreshold;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
