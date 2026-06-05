-- ============================================================
-- Performance Indexes for Common Query Patterns
-- ============================================================

-- Products: active + featured/trending/new-arrival filtering
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products (active, featured) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_trending ON products (active, trending) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_new_arrival ON products (active, is_new_arrival) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_on_sale ON products (active, is_on_sale) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products (category_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Orders: user lookup + status filtering
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Order Items: product lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- Payments: gateway lookups + user lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON payments (gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);

-- Reviews: product rating lookup
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews (approved);

-- Categories: active filtering + slug lookup
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (active) WHERE active = true;

-- Users: email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Payment Gateway Config: active + sort lookup
CREATE INDEX IF NOT EXISTS idx_payment_gateway_config_active_sort ON payment_gateway_config (enabled, sort_order) WHERE enabled = true;
