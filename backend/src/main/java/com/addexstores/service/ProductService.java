package com.addexstores.service;

import com.addexstores.dto.request.ProductRequest;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ProductResponse;

public interface ProductService {

    PagedResponse<ProductResponse> getAllProducts(int page, int size, String sort, Long category,
                                                  Long subcategory, String brand, Double minPrice,
                                                  Double maxPrice, Boolean featured, Boolean trending,
                                                  Boolean newArrival, Boolean onSale, String search);

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySlug(String slug);

    PagedResponse<ProductResponse> getFeaturedProducts(int page, int size);

    PagedResponse<ProductResponse> getTrendingProducts(int page, int size);

    PagedResponse<ProductResponse> getNewArrivals(int page, int size);

    PagedResponse<ProductResponse> getOnSaleProducts(int page, int size);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
