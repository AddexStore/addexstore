-- ============================================================
-- V101: Master settings (singleton)
-- ============================================================

INSERT INTO settings (site_name, currency, tax_rate, shipping_cost, free_shipping_threshold)
SELECT 'AddexStores', 'INR', 8.50, 12.99, 150.00
WHERE NOT EXISTS (SELECT 1 FROM settings);
