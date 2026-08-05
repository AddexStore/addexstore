-- ============================================================
-- V102: Master tax rules (US default 8% baked in from legacy V9)
-- NULL-safe idempotency guard (UNIQUE treats NULLs as distinct)
-- ============================================================

INSERT INTO tax_rules (country, state, rate, name, active)
SELECT v.country, v.state, v.rate, v.name, v.active
FROM (VALUES
    ('US', NULL, 8.00,  'US Tax (Default 8%)', TRUE),
    ('US', 'CA', 8.50,  'California Sales Tax', TRUE),
    ('US', 'NY', 8.875, 'New York Sales Tax', TRUE),
    ('US', 'TX', 6.25,  'Texas Sales Tax', TRUE),
    ('US', 'FL', 6.00,  'Florida Sales Tax', TRUE),
    ('GB', NULL, 20.00, 'UK VAT', TRUE),
    ('CA', NULL, 5.00,  'Canada GST', TRUE),
    ('AE', NULL, 5.00,  'UAE VAT', TRUE),
    ('FR', NULL, 20.00, 'France VAT', TRUE),
    ('IT', NULL, 22.00, 'Italy VAT', TRUE),
    ('IN', NULL, 18.00, 'India GST', TRUE)
) AS v(country, state, rate, name, active)
WHERE NOT EXISTS (
    SELECT 1 FROM tax_rules t
    WHERE t.country = v.country
      AND t.state IS NOT DISTINCT FROM v.state
);
