-- ============================================================
-- V104: Master currency rates (static reference data)
-- ============================================================

INSERT INTO currency_rates (currency_code, rate_to_usd, symbol, active)
SELECT v.currency_code, v.rate_to_usd, v.symbol, v.active
FROM (VALUES
    ('USD', 1.000000, '$',   TRUE),
    ('EUR', 0.920000, '€',   TRUE),
    ('GBP', 0.790000, '£',   TRUE),
    ('AED', 3.670000, 'د.إ', TRUE),
    ('INR', 83.000000, '₹',  TRUE)
) AS v(currency_code, rate_to_usd, symbol, active)
ON CONFLICT (currency_code) DO NOTHING;
