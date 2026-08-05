-- ============================================================
-- V106: Master banners
-- ============================================================

INSERT INTO banners (title, subtitle, cta, cta_link, bg_color, image, sort_order, active)
SELECT v.title, v.subtitle, v.cta, v.cta_link, v.bg_color, v.image, v.sort_order, v.active
FROM (VALUES
    ('Summer Collection 2026',   'Discover the season''s most coveted pieces from top luxury brands.', 'Shop Now',  '/category/summer',  '#1a1a2e', '/assets/banners/summer.jpg',  1, TRUE),
    ('Luxury Watches Sale',      'Up to 30% off on premium Swiss timepieces. Limited time.',           'Explore',   '/category/watches',  '#16213e', '/assets/banners/watches.jpg',  2, TRUE),
    ('New Arrivals',             'Be the first to own the latest drops from Gucci, Prada & more.',     'View New',  '/new-arrivals',      '#0f3460', '/assets/banners/new.jpg',      3, TRUE),
    ('Designer Bags Collection', 'Curated selection of iconic handbags. Express shipping worldwide.',   'Shop Bags', '/category/bags',     '#533483', '/assets/banners/bags.jpg',      4, TRUE),
    ('Fine Jewelry',             'Exquisite diamond and gold pieces for life''s special moments.',       'Discover',  '/category/jewelry',  '#e94560', '/assets/banners/jewelry.jpg',   5, TRUE)
) AS v(title, subtitle, cta, cta_link, bg_color, image, sort_order, active)
ON CONFLICT (title) DO NOTHING;
