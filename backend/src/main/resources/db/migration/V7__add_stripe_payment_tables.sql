ALTER TABLE payments
    ADD COLUMN stripe_payment_intent_id VARCHAR(255) DEFAULT NULL AFTER gateway_response,
    ADD COLUMN base_amount DECIMAL(10, 2) DEFAULT NULL AFTER amount,
    ADD COLUMN converted_amount DECIMAL(10, 2) DEFAULT NULL AFTER base_amount,
    ADD COLUMN customer_email VARCHAR(255) DEFAULT NULL AFTER converted_amount,
    ADD INDEX idx_payments_stripe_intent (stripe_payment_intent_id),
    ADD INDEX idx_payments_currency (currency),
    ADD INDEX idx_payments_status (status);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    transaction_id VARCHAR(255) DEFAULT NULL,
    gateway VARCHAR(50) NOT NULL DEFAULT 'STRIPE',
    currency VARCHAR(3) DEFAULT 'USD',
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    response_payload TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_transactions_payment (payment_id),
    INDEX idx_transactions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    refund_id VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(500) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_refunds_payment (payment_id),
    INDEX idx_refunds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
