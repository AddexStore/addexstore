package com.addexstores.service.impl;

import com.addexstores.dto.request.CategoryRequest;
import com.addexstores.dto.request.SubCategoryRequest;
import com.addexstores.dto.response.CategoryResponse;
import com.addexstores.dto.response.SubCategoryResponse;
import com.addexstores.entity.Category;
import com.addexstores.entity.SubCategory;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.CategoryMapper;
import com.addexstores.repository.CategoryRepository;
import com.addexstores.repository.SubCategoryRepository;
import com.addexstores.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return CategoryMapper.toCategoryResponseList(categories);
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return CategoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Category name is required");
        }

        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(generateSlug(request.getName()))
                .description(request.getDescription())
                .icon(request.getIcon())
                .image(request.getImage())
                .build();

        category = categoryRepository.save(category);
        log.info("Category created: {}", category.getName());
        return CategoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (request.getName() != null) {
            if (!request.getName().equals(category.getName()) && categoryRepository.existsByName(request.getName())) {
                throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
            }
            category.setName(request.getName());
            category.setSlug(generateSlug(request.getName()));
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getIcon() != null && !request.getIcon().isEmpty()) {
            category.setIcon(request.getIcon());
        }
        if (request.getImage() != null) {
            category.setImage(request.getImage());
        }

        category = categoryRepository.save(category);
        log.info("Category updated: {}", category.getName());
        return CategoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(false);
        categoryRepository.save(category);
        log.info("Category deactivated: {}", category.getName());
    }

    @Override
    @Transactional
    public SubCategoryResponse addSubCategory(Long categoryId, SubCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        SubCategory subCategory = SubCategory.builder()
                .name(request.getName())
                .slug(generateSlug(request.getName()))
                .icon(request.getIcon())
                .category(category)
                .build();

        subCategory = subCategoryRepository.save(subCategory);
        log.info("SubCategory created: {} for category: {}", request.getName(), category.getName());

        return CategoryMapper.toSubCategoryResponse(subCategory);
    }

    @Override
    @Transactional
    public SubCategoryResponse updateSubCategory(Long subCategoryId, SubCategoryRequest request) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", subCategoryId));

        if (request.getName() != null) {
            subCategory.setName(request.getName());
            subCategory.setSlug(generateSlug(request.getName()));
        }
        if (request.getIcon() != null && !request.getIcon().isEmpty()) {
            subCategory.setIcon(request.getIcon());
        }

        subCategory = subCategoryRepository.save(subCategory);
        log.info("SubCategory updated: {}", subCategory.getName());

        return CategoryMapper.toSubCategoryResponse(subCategory);
    }

    @Override
    @Transactional
    public void deleteSubCategory(Long subCategoryId) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", subCategoryId));
        subCategoryRepository.delete(subCategory);
        log.info("SubCategory deleted: {}", subCategory.getName());
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
    }
}
