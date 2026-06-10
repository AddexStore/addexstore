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

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @Override
    @Cacheable(value = "products", key = "'all_' + #page + '_' + #size + '_' + #sort + '_' + #category + '_' + #subcategory + '_' + #brand + '_' + #minPrice + '_' + #maxPrice + '_' + #featured + '_' + #trending + '_' + #newArrival + '_' + #onSale + '_' + #search")
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sort, Long category,
                                                           Long subcategory, String brand, Double minPrice,
                                                           Double maxPrice, Boolean featured, Boolean trending,
                                                           Boolean newArrival, Boolean onSale, String search) {
        Pageable pageable = createPageable(page, size, sort);

        BigDecimal min = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal max = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;

        Page<Product> products = productRepository.findAllFiltered(
                search, category, subcategory, brand, min, max,
                featured, trending, newArrival, onSale, pageable);

        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'byId_' + #id")
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithGraph(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return ProductMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "'bySlug_' + #slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return ProductMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "'featured_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByFeaturedTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'trending_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getTrendingProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByTrendingTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'newArrivals_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getNewArrivals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByIsNewArrivalTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Cacheable(value = "products", key = "'onSale_' + #page + '_' + #size")
    public PagedResponse<ProductResponse> getOnSaleProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByIsOnSaleTrue(pageable);
        return buildPagedResponse(products);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Product name is required");
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
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(generateSlug(request.getName()))
                .description(request.getDescription())
                .brand(request.getBrand())
                .sku(request.getSku())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .stock(request.getStock())
                .featured(request.isFeatured())
                .trending(request.isTrending())
                .isNewArrival(request.isNewArrival())
                .isOnSale(request.isOnSale())
                .saleEndDate(request.getSaleEndDate())
                .category(category)
                .subCategory(subCategory)
                .build();

        if (request.getImages() != null) {
            List<ProductImage> images = new ArrayList<>();
            for (String imageUrl : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .build();
                images.add(image);
            }
            product.setImages(images);
        }

        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductVariantRequest varReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(varReq.getSize())
                        .color(varReq.getColor())
                        .stock(varReq.getStock())
                        .priceOverride(varReq.getPriceOverride())
                        .sku(varReq.getSku())
                        .build();
                variants.add(variant);
            }
            product.setVariants(variants);
        }

        product = productRepository.save(product);
        log.info("Product created: {}", product.getName());

        if (category != null) {
            category.setProductCount(category.getProductCount() + 1);
            categoryRepository.save(category);
        }

        return ProductMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (request.getName() != null) {
            product.setName(request.getName());
            product.setSlug(generateSlug(request.getName()));
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getBrand() != null) {
            product.setBrand(request.getBrand());
        }
        if (request.getSku() != null) {
            product.setSku(request.getSku());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        product.setStock(request.getStock());
        product.setFeatured(request.isFeatured());
        product.setTrending(request.isTrending());
        product.setNewArrival(request.isNewArrival());
        product.setOnSale(request.isOnSale());
        product.setSaleEndDate(request.getSaleEndDate());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", request.getSubCategoryId()));
            product.setSubCategory(subCategory);
        }

        if (request.getImages() != null) {
            product.getImages().clear();
            for (String imageUrl : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .build();
                product.getImages().add(image);
            }
        }

        if (request.getVariants() != null) {
            product.getVariants().clear();
            for (ProductVariantRequest varReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(varReq.getSize())
                        .color(varReq.getColor())
                        .stock(varReq.getStock())
                        .priceOverride(varReq.getPriceOverride())
                        .sku(varReq.getSku())
                        .build();
                product.getVariants().add(variant);
            }
        }

        product = productRepository.save(product);
        log.info("Product updated: {}", product.getName());
        return ProductMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Product soft deleted: {}", product.getName());
    }

    private Pageable createPageable(int page, int size, String sort) {
        if (sort != null && !sort.isBlank()) {
            String[] sortParams = sort.split(",");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            return PageRequest.of(page, size, Sort.by(direction, sortField));
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private PagedResponse<ProductResponse> buildPagedResponse(Page<Product> page) {
        List<ProductResponse> content = ProductMapper.toProductResponseList(page.getContent());
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

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());
        return slug + "-" + uniqueSuffix.substring(uniqueSuffix.length() - 6);
    }
}
