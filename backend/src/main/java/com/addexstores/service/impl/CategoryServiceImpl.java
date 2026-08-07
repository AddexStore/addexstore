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
import com.addexstores.validation.SvgSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAllByActiveTrueOrderByNameAsc();
        return categoryMapper.toCategoryResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all-admin'")
    public List<CategoryResponse> getAllAdminCategories() {
        List<Category> categories = categoryRepository.findAllByOrderByNameAsc();
        return categoryMapper.toCategoryResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'bySlug_' + #slug")
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        validateName(request.getName());

        String slug = resolveSlug(request.getSlug(), request.getName(), null);

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(trimToNull(request.getDescription()))
                .icon(sanitizeIcon(request.getIcon()))
                .image(trimToNull(request.getImage()))
                .active(request.getActive() == null || request.getActive())
                .build();

        category = categoryRepository.save(category);
        log.info("Category created: {}", category.getName());
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        boolean nameChanged = request.getName() != null && !request.getName().equals(category.getName());
        if (nameChanged) {
            validateName(request.getName());
            if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
                throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
            }
            category.setName(request.getName().trim());
        }

        if (nameChanged || (request.getSlug() != null && !request.getSlug().isBlank())) {
            String slug = resolveSlug(request.getSlug(), category.getName(), id);
            category.setSlug(slug);
        }

        if (request.getDescription() != null) {
            category.setDescription(trimToNull(request.getDescription()));
        }
        if (request.getIcon() != null) {
            category.setIcon(sanitizeIcon(request.getIcon()));
        }
        if (request.getImage() != null) {
            category.setImage(trimToNull(request.getImage()));
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        category = categoryRepository.save(category);
        log.info("Category updated: {}", category.getName());
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(false);
        categoryRepository.save(category);
        log.info("Category deactivated: {}", category.getName());
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public SubCategoryResponse addSubCategory(Long categoryId, SubCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        validateName(request.getName());
        if (subCategoryRepository.existsByNameAndCategoryId(request.getName(), categoryId)) {
            throw new BadRequestException("Subcategory with name '" + request.getName() + "' already exists in this category");
        }

        SubCategory subCategory = SubCategory.builder()
                .name(request.getName().trim())
                .slug(resolveSubCategorySlug(request.getName(), categoryId, null))
                .icon(sanitizeIcon(request.getIcon()))
                .category(category)
                .build();

        subCategory = subCategoryRepository.save(subCategory);
        log.info("SubCategory created: {} for category: {}", subCategory.getName(), category.getName());

        return categoryMapper.toSubCategoryResponse(subCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public SubCategoryResponse updateSubCategory(Long subCategoryId, SubCategoryRequest request) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", subCategoryId));

        if (request.getName() != null && !request.getName().equals(subCategory.getName())) {
            validateName(request.getName());
            if (subCategoryRepository.existsByNameAndCategoryId(request.getName(), subCategory.getCategory().getId())) {
                throw new BadRequestException("Subcategory with name '" + request.getName() + "' already exists in this category");
            }
            subCategory.setName(request.getName().trim());
            subCategory.setSlug(resolveSubCategorySlug(subCategory.getName(), subCategory.getCategory().getId(), subCategoryId));
        }
        if (request.getIcon() != null) {
            subCategory.setIcon(sanitizeIcon(request.getIcon()));
        }

        subCategory = subCategoryRepository.save(subCategory);
        log.info("SubCategory updated: {}", subCategory.getName());

        return categoryMapper.toSubCategoryResponse(subCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteSubCategory(Long subCategoryId) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", subCategoryId));
        subCategoryRepository.delete(subCategory);
        log.info("SubCategory deleted: {}", subCategory.getName());
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Name is required");
        }
    }

    private String resolveSlug(String requestedSlug, String name, Long currentId) {
        String base = requestedSlug != null && !requestedSlug.isBlank()
                ? requestedSlug.toLowerCase(Locale.ENGLISH)
                : generateSlug(name);
        if (!SLUG_PATTERN.matcher(base).matches()) {
            throw new BadRequestException("Slug may only contain lowercase letters, numbers and hyphens");
        }
        String candidate = base;
        int suffix = 1;
        while (isSlugTaken(candidate, currentId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private boolean isSlugTaken(String slug, Long currentId) {
        return categoryRepository.findBySlug(slug)
                .map(existing -> currentId == null || !existing.getId().equals(currentId))
                .orElse(false);
    }

    private String resolveSubCategorySlug(String name, Long categoryId, Long currentId) {
        String base = generateSlug(name);
        String candidate = base;
        int suffix = 1;
        while (isSubSlugTaken(candidate, categoryId, currentId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private boolean isSubSlugTaken(String slug, Long categoryId, Long currentId) {
        return subCategoryRepository.findByCategoryIdOrderByNameAsc(categoryId).stream()
                .anyMatch(sub -> sub.getSlug().equals(slug) && (currentId == null || !sub.getId().equals(currentId)));
    }

    private String sanitizeIcon(String icon) {
        if (icon == null || icon.isBlank()) {
            return null;
        }
        String trimmed = icon.trim();
        if (trimmed.startsWith("<")) {
            String sanitized = SvgSanitizer.sanitize(trimmed);
            if (sanitized.isBlank()) {
                throw new BadRequestException("Invalid or unsafe SVG icon content");
            }
            return sanitized;
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isBlank()) {
            slug = "category";
        }
        return slug;
    }
}
