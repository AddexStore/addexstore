-- ============================================================
-- V105: Master payment gateway config
-- ============================================================

INSERT INTO payment_gateway_config (gateway, enabled, sort_order, display_name, supported_methods)
SELECT v.gateway, v.enabled, v.sort_order, v.display_name, v.supported_methods
FROM (VALUES
    ('STRIPE', TRUE, 1, 'Credit/Debit Card (Stripe)', 'card,international'),
    ('RAZORPAY', TRUE, 2, 'UPI/Cards/NetBanking (Razorpay)', 'upi,card,netbanking,wallet')
) AS v(gateway, enabled, sort_order, display_name, supported_methods)
ON CONFLICT (gateway) DO NOTHING;
