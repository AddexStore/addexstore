-- ============================================================
-- V108: Backfill category and subcategory product counts
-- Reconciles the denormalized counters with the actual number
-- of active products, in case counts drifted over time.
-- ============================================================

UPDATE categories c
SET product_count = (
    SELECT COUNT(*)
    FROM products p
    WHERE p.category_id = c.id AND p.active = TRUE
);

UPDATE sub_categories s
SET product_count = (
    SELECT COUNT(*)
    FROM products p
    WHERE p.sub_category_id = s.id AND p.active = TRUE
);
