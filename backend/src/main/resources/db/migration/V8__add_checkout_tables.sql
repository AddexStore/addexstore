CREATE TABLE IF NOT EXISTS tax_rules (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    rate DECIMAL(5, 2) NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_country ON tax_rules (country);
CREATE INDEX IF NOT EXISTS idx_tax_active ON tax_rules (active);

CREATE TABLE IF NOT EXISTS shipping_rules (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    min_order_amount DECIMAL(10, 2),
    cost DECIMAL(10, 2) NOT NULL,
    free_shipping_threshold DECIMAL(10, 2),
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipping_country ON shipping_rules (country);
CREATE INDEX IF NOT EXISTS idx_shipping_active ON shipping_rules (active);

CREATE TABLE IF NOT EXISTS currency_rates (
    id BIGSERIAL PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    rate_to_usd DECIMAL(10, 6) NOT NULL,
    symbol VARCHAR(10) NOT NULL DEFAULT '$',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_currency_code ON currency_rates (currency_code);
CREATE INDEX IF NOT EXISTS idx_currency_active ON currency_rates (active);

INSERT INTO tax_rules (country, state, rate, name, active) VALUES
    ('US', NULL, 0.00, 'No Tax (Default)', TRUE),
    ('US', 'CA', 8.50, 'California Sales Tax', TRUE),
    ('US', 'NY', 8.875, 'New York Sales Tax', TRUE),
    ('US', 'TX', 6.25, 'Texas Sales Tax', TRUE),
    ('US', 'FL', 6.00, 'Florida Sales Tax', TRUE),
    ('GB', NULL, 20.00, 'UK VAT', TRUE),
    ('CA', NULL, 5.00, 'Canada GST', TRUE),
    ('AE', NULL, 5.00, 'UAE VAT', TRUE),
    ('FR', NULL, 20.00, 'France VAT', TRUE),
    ('IT', NULL, 22.00, 'Italy VAT', TRUE),
    ('IN', NULL, 18.00, 'India GST', TRUE);

INSERT INTO shipping_rules (country, min_order_amount, cost, free_shipping_threshold, name, active) VALUES
    ('US', NULL, 9.99, 100.00, 'US Standard Shipping', TRUE),
    ('GB', NULL, 12.99, 150.00, 'UK Standard Shipping', TRUE),
    ('CA', NULL, 14.99, 120.00, 'Canada Standard Shipping', TRUE),
    ('AE', NULL, 15.00, 200.00, 'UAE Standard Shipping', TRUE),
    ('FR', NULL, 10.99, 150.00, 'France Standard Shipping', TRUE),
    ('IT', NULL, 10.99, 150.00, 'Italy Standard Shipping', TRUE);

INSERT INTO currency_rates (currency_code, rate_to_usd, symbol, active) VALUES
    ('USD', 1.000000, '$', TRUE),
    ('EUR', 0.920000, '€', TRUE),
    ('GBP', 0.790000, '£', TRUE),
    ('AED', 3.670000, 'د.إ', TRUE),
    ('INR', 83.000000, '₹', TRUE);
