-- ============================================================
-- V107: Category concurrency + query optimization columns
-- Adds optimistic-lock version columns and subcategory
-- updated_at tracking to back the hardened Categories module.
-- ============================================================

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE sub_categories
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_sub_categories_category_name
    ON sub_categories (category_id, name);
