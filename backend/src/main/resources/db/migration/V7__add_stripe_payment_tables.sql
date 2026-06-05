ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS base_amount DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS converted_amount DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_currency ON payments (currency);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    transaction_id VARCHAR(255),
    gateway VARCHAR(50) NOT NULL DEFAULT 'STRIPE',
    currency VARCHAR(3) DEFAULT 'USD',
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    response_payload TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment ON payment_transactions (payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions (status);

CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    refund_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds (payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds (status);
