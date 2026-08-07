-- ============================================================
-- V202: Additional master currency rates (static reference data)
-- ============================================================

INSERT INTO currency_rates (currency_code, rate_to_usd, symbol, active)
SELECT v.currency_code, v.rate_to_usd, v.symbol, v.active
FROM (VALUES
    ('AUD', 1.500000, '$',   TRUE),
    ('SAR', 3.750000, 'ر.س', TRUE),
    ('CAD', 1.350000, '$',   TRUE),
    ('JPY', 150.000000, '¥', TRUE)
) AS v(currency_code, rate_to_usd, symbol, active)
ON CONFLICT (currency_code) DO NOTHING;
