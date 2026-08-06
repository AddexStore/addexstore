package com.addexstores.repository;

import com.addexstores.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    List<SubCategory> findByCategoryIdOrderByNameAsc(Long categoryId);

    boolean existsByNameAndCategoryId(String name, Long categoryId);

    @Modifying
    @Query("UPDATE SubCategory s SET s.productCount = :count WHERE s.id = :id")
    void updateProductCount(@Param("id") Long id, @Param("count") int count);
}
