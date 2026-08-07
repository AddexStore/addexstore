package com.addexstores.repository;

import com.addexstores.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Optional<Product> findBySku(String sku);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithGraph(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :id AND p.stock >= :qty")
    int decrementStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :qty WHERE p.id = :id")
    int incrementStock(@Param("id") Long id, @Param("qty") int qty);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndCategoryId(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndSubCategoryId(Long subCategoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndFeaturedTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndTrendingTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndIsNewArrivalTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    Page<Product> findByActiveTrueAndIsOnSaleTrue(Pageable pageable);

    List<Product> findByActiveTrueAndStockLessThan(int threshold);

    long countByActiveTrueAndStockLessThan(int threshold);

    long countByCategoryIdAndActiveTrue(Long categoryId);

    long countBySubCategoryIdAndActiveTrue(Long subCategoryId);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:text AS string), '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', CAST(:text AS string), '%')))")
    Page<Product> search(@Param("text") String text, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "subCategory"})
    @Query("SELECT p FROM Product p WHERE (:includeInactive = TRUE OR p.active = TRUE) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:subcategoryId IS NULL OR p.subCategory.id = :subcategoryId) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:stockMin IS NULL OR p.stock >= :stockMin) AND " +
           "(:stockMax IS NULL OR p.stock <= :stockMax) AND " +
           "(:featured IS NULL OR p.featured = :featured) AND " +
           "(:trending IS NULL OR p.trending = :trending) AND " +
           "(:newArrival IS NULL OR p.isNewArrival = :newArrival) AND " +
           "(:onSale IS NULL OR p.isOnSale = :onSale) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Product> findAllFiltered(@Param("includeInactive") Boolean includeInactive,
                                  @Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  @Param("subcategoryId") Long subcategoryId,
                                  @Param("brand") String brand,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("stockMin") Integer stockMin,
                                  @Param("stockMax") Integer stockMax,
                                  @Param("featured") Boolean featured,
                                  @Param("trending") Boolean trending,
                                  @Param("newArrival") Boolean newArrival,
                                  @Param("onSale") Boolean onSale,
                                  Pageable pageable);
}
