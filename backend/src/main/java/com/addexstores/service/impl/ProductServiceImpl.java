package com.addexstores.service.impl;

import com.addexstores.dto.request.ProductRequest;
import com.addexstores.dto.request.ProductVariantRequest;
import com.addexstores.dto.response.PagedResponse;
import com.addexstores.dto.response.ProductResponse;
import com.addexstores.entity.Category;
import com.addexstores.entity.Product;
import com.addexstores.entity.ProductImage;
import com.addexstores.entity.ProductVariant;
import com.addexstores.entity.SubCategory;
import com.addexstores.exception.BadRequestException;
import com.addexstores.exception.ResourceNotFoundException;
import com.addexstores.mapper.ProductMapper;
import com.addexstores.repository.CategoryRepository;
import com.addexstores.repository.ProductRepository;
import com.addexstores.repository.SubCategoryRepository;
import com.addexstores.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_IMAGES = 10;
    private static final int MAX_VARIANTS = 50;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "updatedAt", "name", "price", "stock", "rating", "totalReviews",
            "featured", "trending", "isNewArrival", "isOnSale");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductMapper productMapper;

    @Override
    @Cacheable(value = "products", key = "'all_' + #page + '_' + #size + '_' + #sort + '_' + #category + '_' + #subcategory + '_' + #brand + '_' + #minPrice + '_' + #maxPrice + '_' + #stockStatus + '_' + #featured + '_' + #trending + '_' + #newArrival + '_' + #onSale + '_' + #search")
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sort, Long category,
                                                           Long subcategory, String brand, Double minPrice,
                                                           Double maxPrice, String stockStatus, Boolean featured,
                                                           Boolean trending, Boolean newArrival, Boolean onSale,
                                                           String search) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = createPageable(safePage, safeSize, sort);

        BigDecimal min = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal max = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;
        Integer[] stockRange = resolveStockRange(stockStatus);

        Page<Product> products = productRepository.findAllFiltered(
                search, category, subcategory, brand, min, max,
                stockRange[0], stockRange[1],
                featured, trending, newArrival, onSale, pageable);

        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'byId_' + #id")
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithGraph(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "'bySlug_' + #slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "'featured_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Product> products = productRepository.findByActiveTrueAndFeaturedTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'trending_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getTrendingProducts(int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Product> products = productRepository.findByActiveTrueAndTrendingTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'newArrivals_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getNewArrivals(int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Product> products = productRepository.findByActiveTrueAndIsNewArrivalTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'onSale_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getOnSaleProducts(int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Product> products = productRepository.findByActiveTrueAndIsOnSaleTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "categories"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Product name is required");
        }

        validateDiscount(request.getDiscountPercentage());
        validateImageUrls(request.getImages());
        validateVariants(request.getVariants());

        if (request.getStock() < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }
        if (request.getPrice() == null || request.getPrice().signum() <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        SubCategory subCategory = null;
        if (request.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", request.getSubCategoryId()));
            ensureSubCategoryBelongsToCategory(subCategory, request.getCategoryId());
        }

        String sku = normalizeSku(request.getSku(), null);

        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(generateUniqueSlug(request.getName(), null))
                .description(request.getDescription())
                .brand(trimToNull(request.getBrand()))
                .sku(sku)
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .discountPercentage(request.getDiscountPercentage())
                .stock(request.getStock())
                .featured(request.isFeatured())
                .trending(request.isTrending())
                .isNewArrival(request.isNewArrival())
                .isOnSale(request.isOnSale())
                .saleEndDate(request.getSaleEndDate())
                .category(category)
                .subCategory(subCategory)
                .active(request.getActive() == null || request.getActive())
                .build();

        if (request.getImages() != null) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImages().size(); i++) {
                images.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImages().get(i).trim())
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build());
            }
            product.setImages(images);
        }

        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductVariantRequest varReq : request.getVariants()) {
                variants.add(ProductVariant.builder()
                        .product(product)
                        .size(trimToNull(varReq.getSize()))
                        .color(trimToNull(varReq.getColor()))
                        .stock(varReq.getStock())
                        .priceOverride(varReq.getPriceOverride())
                        .sku(trimToNull(varReq.getSku()))
                        .build());
            }
            product.setVariants(variants);
        }

        product = productRepository.save(product);
        log.info("Product created: {}", product.getName());

        if (category != null) {
            refreshCategoryProductCount(category.getId());
        }
        if (subCategory != null) {
            refreshSubCategoryProductCount(subCategory.getId());
        }

        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "categories"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        Long previousCategoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        Long previousSubCategoryId = product.getSubCategory() != null ? product.getSubCategory().getId() : null;

        validateDiscount(request.getDiscountPercentage());
        validateImageUrls(request.getImages());
        validateVariants(request.getVariants());

        if (request.getStock() < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }
        if (request.getPrice() != null && request.getPrice().signum() <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }

        if (request.getName() != null) {
            String newName = request.getName().trim();
            if (newName.isBlank()) {
                throw new BadRequestException("Product name cannot be blank");
            }
            if (!newName.equals(product.getName())) {
                product.setName(newName);
                product.setSlug(generateUniqueSlug(newName, id));
            }
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getBrand() != null) {
            product.setBrand(trimToNull(request.getBrand()));
        }
        if (request.getSku() != null) {
            product.setSku(normalizeSku(request.getSku(), id));
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getDiscountPercentage() != null) {
            product.setDiscountPercentage(request.getDiscountPercentage());
        }
        product.setStock(request.getStock());
        product.setFeatured(request.isFeatured());
        product.setTrending(request.isTrending());
        product.setNewArrival(request.isNewArrival());
        product.setOnSale(request.isOnSale());
        product.setSaleEndDate(request.getSaleEndDate());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", request.getSubCategoryId()));
            ensureSubCategoryBelongsToCategory(subCategory, request.getCategoryId() != null
                    ? request.getCategoryId()
                    : (product.getCategory() != null ? product.getCategory().getId() : null));
            product.setSubCategory(subCategory);
        }

        if (request.getImages() != null) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImages().size(); i++) {
                images.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImages().get(i).trim())
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build());
            }
            product.getImages().clear();
            product.getImages().addAll(images);
        }

        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductVariantRequest varReq : request.getVariants()) {
                variants.add(ProductVariant.builder()
                        .product(product)
                        .size(trimToNull(varReq.getSize()))
                        .color(trimToNull(varReq.getColor()))
                        .stock(varReq.getStock())
                        .priceOverride(varReq.getPriceOverride())
                        .sku(trimToNull(varReq.getSku()))
                        .build());
            }
            product.getVariants().clear();
            product.getVariants().addAll(variants);
        }

        product = productRepository.save(product);
        log.info("Product updated: {}", product.getName());

        Set<Long> categoryIds = new HashSet<>();
        if (previousCategoryId != null) {
            categoryIds.add(previousCategoryId);
        }
        if (product.getCategory() != null) {
            categoryIds.add(product.getCategory().getId());
        }
        categoryIds.forEach(this::refreshCategoryProductCount);

        Set<Long> subCategoryIds = new HashSet<>();
        if (previousSubCategoryId != null) {
            subCategoryIds.add(previousSubCategoryId);
        }
        if (product.getSubCategory() != null) {
            subCategoryIds.add(product.getSubCategory().getId());
        }
        subCategoryIds.forEach(this::refreshSubCategoryProductCount);

        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "categories"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        Long subCategoryId = product.getSubCategory() != null ? product.getSubCategory().getId() : null;

        product.setActive(false);
        productRepository.save(product);
        log.info("Product soft deleted: {}", product.getName());

        if (categoryId != null) {
            refreshCategoryProductCount(categoryId);
        }
        if (subCategoryId != null) {
            refreshSubCategoryProductCount(subCategoryId);
        }
    }

    private String normalizeSku(String sku, Long excludeId) {
        if (sku == null || sku.isBlank()) {
            throw new BadRequestException("SKU is required");
        }
        String normalized = sku.trim().toUpperCase(Locale.ENGLISH);
        if (excludeId == null) {
            if (productRepository.existsBySku(normalized)) {
                throw new BadRequestException("SKU already exists: " + normalized);
            }
        } else if (productRepository.existsBySkuAndIdNot(normalized, excludeId)) {
            throw new BadRequestException("SKU already exists: " + normalized);
        }
        return normalized;
    }

    private void ensureSubCategoryBelongsToCategory(SubCategory subCategory, Long categoryId) {
        if (categoryId == null || subCategory.getCategory() == null) {
            return;
        }
        if (!subCategory.getCategory().getId().equals(categoryId)) {
            throw new BadRequestException("Subcategory does not belong to the selected category");
        }
    }

    private void validateDiscount(Integer discountPercentage) {
        if (discountPercentage != null && (discountPercentage < 0 || discountPercentage > 100)) {
            throw new BadRequestException("Discount percentage must be between 0 and 100");
        }
    }

    private void validateImageUrls(List<String> images) {
        if (images == null) {
            return;
        }
        if (images.size() > MAX_IMAGES) {
            throw new BadRequestException("A product can have at most " + MAX_IMAGES + " images");
        }
        for (String url : images) {
            if (url == null || url.isBlank()) {
                throw new BadRequestException("Image URL cannot be empty");
            }
            if (url.trim().startsWith("data:")) {
                throw new BadRequestException("Inline data URIs are not allowed for product images. Upload the image first.");
            }
            if (url.trim().length() > 500) {
                throw new BadRequestException("Image URL cannot exceed 500 characters");
            }
        }
    }

    private void validateVariants(List<ProductVariantRequest> variants) {
        if (variants == null) {
            return;
        }
        if (variants.size() > MAX_VARIANTS) {
            throw new BadRequestException("A product can have at most " + MAX_VARIANTS + " variants");
        }
        Set<String> keys = new HashSet<>();
        for (ProductVariantRequest variant : variants) {
            if (variant.getStock() < 0) {
                throw new BadRequestException("Variant stock cannot be negative");
            }
            if (variant.getPriceOverride() != null && variant.getPriceOverride().signum() < 0) {
                throw new BadRequestException("Variant price cannot be negative");
            }
            String size = variant.getSize() == null ? "" : variant.getSize().trim();
            String color = variant.getColor() == null ? "" : variant.getColor().trim();
            String key = size + "|" + color;
            if (!keys.add(key)) {
                throw new BadRequestException("Duplicate variant for size '" + size + "' and color '" + color + "'");
            }
        }
    }

    private String generateUniqueSlug(String name, Long excludeId) {
        String base = slugify(name);
        if (base.isBlank()) {
            throw new BadRequestException("Could not generate a valid slug from the product name");
        }
        String candidate = base;
        int suffix = 1;
        while (excludeId == null
                ? productRepository.existsBySlug(candidate)
                : productRepository.existsBySlugAndIdNot(candidate, excludeId)) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    private String slugify(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Integer[] resolveStockRange(String stockStatus) {
        if (stockStatus == null) {
            return new Integer[]{null, null};
        }
        switch (stockStatus.toLowerCase(Locale.ENGLISH)) {
            case "in":
                return new Integer[]{1, null};
            case "low":
                return new Integer[]{1, 10};
            case "out":
                return new Integer[]{null, 0};
            default:
                return new Integer[]{null, null};
        }
    }

    private Pageable createPageable(int page, int size, String sort) {
        if (sort != null && !sort.isBlank()) {
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            if (ALLOWED_SORT_FIELDS.contains(sortField)) {
                Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC : Sort.Direction.ASC;
                return PageRequest.of(page, size, Sort.by(direction, sortField));
            }
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private Pageable pageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private PagedResponse<ProductResponse> buildPagedResponse(Page<Product> page) {
        List<ProductResponse> content = productMapper.toProductResponseList(page.getContent());
        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    private void refreshCategoryProductCount(Long categoryId) {
        if (categoryId == null) {
            return;
        }
        int count = (int) productRepository.countByCategoryIdAndActiveTrue(categoryId);
        categoryRepository.updateProductCount(categoryId, count);
        log.debug("Refreshed product count for category {}: {}", categoryId, count);
    }

    private void refreshSubCategoryProductCount(Long subCategoryId) {
        if (subCategoryId == null) {
            return;
        }
        int count = (int) productRepository.countBySubCategoryIdAndActiveTrue(subCategoryId);
        subCategoryRepository.updateProductCount(subCategoryId, count);
        log.debug("Refreshed product count for subcategory {}: {}", subCategoryId, count);
    }
}
