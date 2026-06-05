CREATE TABLE IF NOT EXISTS payment_gateway_config (
    id BIGSERIAL PRIMARY KEY,
    gateway VARCHAR(50) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    display_name VARCHAR(100),
    supported_methods VARCHAR(500),
    min_amount DECIMAL(10, 2),
    max_amount DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_gateway_config (gateway, enabled, sort_order, display_name, supported_methods)
VALUES ('STRIPE', TRUE, 1, 'Credit/Debit Card (Stripe)', 'card,international')
ON CONFLICT (gateway) DO NOTHING;

INSERT INTO payment_gateway_config (gateway, enabled, sort_order, display_name, supported_methods)
VALUES ('RAZORPAY', TRUE, 2, 'UPI/Cards/NetBanking (Razorpay)', 'upi,card,netbanking,wallet')
ON CONFLICT (gateway) DO NOTHING;
