package com.addexstores.repository;

import com.addexstores.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category", "subCategory", "images", "variants"})
    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    @EntityGraph(attributePaths = {"category", "subCategory", "images", "variants"})
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithGraph(@Param("id") Long id);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findBySubCategoryId(Long subCategoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findByFeaturedTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findByTrendingTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findByIsNewArrivalTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findByIsOnSaleTrue(Pageable pageable);

    List<Product> findByActiveTrueAndStockLessThan(int threshold);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :text, '%')))")
    Page<Product> search(@Param("text") String text, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:subcategoryId IS NULL OR p.subCategory.id = :subcategoryId) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:featured IS NULL OR p.featured = :featured) AND " +
           "(:trending IS NULL OR p.trending = :trending) AND " +
           "(:newArrival IS NULL OR p.isNewArrival = :newArrival) AND " +
           "(:onSale IS NULL OR p.isOnSale = :onSale) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findAllFiltered(@Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  @Param("subcategoryId") Long subcategoryId,
                                  @Param("brand") String brand,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("featured") Boolean featured,
                                  @Param("trending") Boolean trending,
                                  @Param("newArrival") Boolean newArrival,
                                  @Param("onSale") Boolean onSale,
                                  Pageable pageable);
}
