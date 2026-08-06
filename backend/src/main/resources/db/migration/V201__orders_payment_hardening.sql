-- V201: Orders module hardening
-- 1) Track the pricing currency on each order (gateway-created orders are USD-priced internally).
-- 2) Enforce webhook/transaction idempotency at the database level.

ALTER TABLE orders
    ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_transactions_payment_tx
    ON payment_transactions (payment_id, transaction_id)
    WHERE transaction_id IS NOT NULL;
