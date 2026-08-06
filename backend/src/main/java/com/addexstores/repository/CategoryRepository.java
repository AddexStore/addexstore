package com.addexstores.repository;

import com.addexstores.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @EntityGraph(attributePaths = "subCategories")
    List<Category> findAllByActiveTrueOrderByNameAsc();

    @EntityGraph(attributePaths = "subCategories")
    List<Category> findAllByOrderByNameAsc();

    Optional<Category> findBySlug(String slug);

    @EntityGraph(attributePaths = "subCategories")
    Optional<Category> findBySlugAndActiveTrue(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    @Modifying
    @Query("UPDATE Category c SET c.productCount = :count WHERE c.id = :id")
    void updateProductCount(@Param("id") Long id, @Param("count") int count);
}
