-- ============================================================
-- V109: Products module hardening
-- Enforces variant uniqueness (product_id, size, color) so the
-- Products module can safely use full-replace variant semantics,
-- and backfills any seeded duplicates before the constraint is
-- applied. `sku` already has a UNIQUE constraint (V001).
-- ============================================================

-- 1) Deduplicate existing variants, keeping the lowest id per
--    (product_id, size, color) combination. Safe on empty tables.
DELETE FROM product_variants a
USING product_variants b
WHERE a.id > b.id
  AND a.product_id = b.product_id
  AND COALESCE(a.size, '') = COALESCE(b.size, '')
  AND COALESCE(a.color, '') = COALESCE(b.color, '');

-- 2) Enforce uniqueness of (product_id, size, color).
ALTER TABLE product_variants
    ADD CONSTRAINT uq_product_variants_product_size_color
        UNIQUE (product_id, size, color);

-- 3) Add a dedicated lookup index for variant queries by SKU
--    (works alongside the existing UNIQUE(sku) constraint).
CREATE INDEX IF NOT EXISTS idx_variants_sku
    ON product_variants (sku);
