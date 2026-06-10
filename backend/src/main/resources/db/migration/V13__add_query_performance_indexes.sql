-- ============================================================
-- Additional Performance Indexes for Optimized Query Patterns
-- ============================================================

-- Composite index for default listing query (active=TRUE + createdAt DESC sort)
-- Most product listing queries filter by active=true and sort by created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_active_created_desc ON products (active, created_at DESC) WHERE active = true;

-- Simple name/brand search index (improves LIKE queries via B-tree)
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_products_brand_lower ON products (LOWER(brand));

-- Composite index for cumulative filter query (active + category + price)
-- Used by the findAllFiltered() JPQL query which combines multiple optional filters
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products (category_id, price) WHERE active = true;

-- Covering index for subcategory filtering
CREATE INDEX IF NOT EXISTS idx_products_subcategory_active ON products (sub_category_id, active) WHERE active = true;
