DROP TABLE IF EXISTS settings;

CREATE TABLE settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    site_description VARCHAR(5000),
    logo VARCHAR(255),
    favicon VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(2000),
    currency VARCHAR(255) NOT NULL DEFAULT 'USD',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 8.50,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    free_shipping_threshold DECIMAL(10,2),
    social_links VARCHAR(5000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (id, site_name, currency, tax_rate, shipping_cost, free_shipping_threshold) VALUES
(1, 'AddexStores', 'INR', 8.50, 12.99, 150.00);
