package com.addexstores.repository;

import com.addexstores.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findBySubCategoryId(Long subCategoryId, Pageable pageable);

    Page<Product> findByFeaturedTrue(Pageable pageable);

    Page<Product> findByTrendingTrue(Pageable pageable);

    Page<Product> findByIsNewArrivalTrue(Pageable pageable);

    Page<Product> findByIsOnSaleTrue(Pageable pageable);

    List<Product> findByActiveTrueAndStockLessThan(int threshold);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :text, '%')))")
    Page<Product> search(@Param("text") String text, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> filterProducts(@Param("categoryId") Long categoryId,
                                 @Param("brand") String brand,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 Pageable pageable);
}
