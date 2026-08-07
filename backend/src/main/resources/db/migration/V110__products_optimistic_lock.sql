-- ============================================================
-- V110: Products optimistic locking
-- Adds a version column so concurrent admin edits of the same
-- product fail with a conflict (409) instead of silent
-- last-write-wins. Idempotent for forward-only re-application.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
