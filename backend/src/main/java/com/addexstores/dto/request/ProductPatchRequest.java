package com.addexstores.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductPatchRequest {

    private Boolean featured;

    private Boolean trending;

    private Boolean newArrival;

    private Boolean onSale;

    private Boolean active;

    private Integer stock;

    private BigDecimal price;
}
