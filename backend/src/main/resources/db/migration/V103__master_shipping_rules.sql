-- ============================================================
-- V103: Master shipping rules
-- ============================================================

INSERT INTO shipping_rules (country, min_order_amount, cost, free_shipping_threshold, name, active)
SELECT v.country, v.min_order_amount::numeric, v.cost, v.free_shipping_threshold, v.name, v.active
FROM (VALUES
    ('US', NULL, 9.99,  100.00, 'US Standard Shipping', TRUE),
    ('GB', NULL, 12.99, 150.00, 'UK Standard Shipping', TRUE),
    ('CA', NULL, 14.99, 120.00, 'Canada Standard Shipping', TRUE),
    ('AE', NULL, 15.00, 200.00, 'UAE Standard Shipping', TRUE),
    ('FR', NULL, 10.99, 150.00, 'France Standard Shipping', TRUE),
    ('IT', NULL, 10.99, 150.00, 'Italy Standard Shipping', TRUE)
) AS v(country, min_order_amount, cost, free_shipping_threshold, name, active)
ON CONFLICT (country, name) DO NOTHING;
