-- ============================================================
-- V200: Initial catalog (products, images, variants)
-- No explicit ids. Products keyed by sku; category/subcategory
-- resolved by slug (subcategory scoped to parent category).
-- ============================================================

INSERT INTO products (name, slug, description, brand, sku, price, original_price, discount_percentage, stock, rating, total_reviews, featured, trending, is_new_arrival, is_on_sale, sale_end_date, category_id, sub_category_id)
SELECT v.name, v.slug, v.description, v.brand, v.sku, v.price, v.original_price, v.discount_percentage, v.stock, v.rating, v.total_reviews, v.featured, v.trending, v.is_new_arrival, v.is_on_sale, v.sale_end_date::timestamp, c.id, sc.id
FROM (VALUES
    ('Gucci Signature Cotton T-Shirt', 'gucci-signature-cotton-tshirt', 'Iconic Gucci cotton t-shirt with signature branding. Crafted from premium Italian cotton with a relaxed fit.', 'Gucci', 'GUC-TS-001', 450.00, 550.00, 18, 50, 4.5, 128, TRUE, TRUE, FALSE, TRUE, '2026-08-31 23:59:59', 'men', 't-shirts'),
    ('Prada Milano Silk Shirt', 'prada-milano-silk-shirt', 'Luxurious Prada silk shirt, tailored in Milan. Features a classic spread collar and mother-of-pearl buttons.', 'Prada', 'PRA-SH-001', 1200.00, NULL, NULL, 25, 4.7, 64, FALSE, TRUE, FALSE, FALSE, NULL, 'men', 'shirts'),
    ('Diesel D-Struk Straight Jeans', 'diesel-d-struk-straight-jeans', 'Straight-leg jeans with distressed detailing and Diesel branding. Made from heavyweight Japanese denim.', 'Diesel', 'DIE-JN-001', 280.00, 350.00, 20, 80, 4.2, 47, FALSE, FALSE, TRUE, TRUE, '2026-07-15 23:59:59', 'men', 'jeans'),
    ('Louis Vuitton Monogram Hoodie', 'louis-vuitton-monogram-hoodie', 'Oversized fleece hoodie with LV Monogram jacquard pattern. Ribbed cuffs and hem with adjustable drawstring hood.', 'Louis Vuitton', 'LV-HD-001', 1850.00, NULL, NULL, 15, 4.8, 92, TRUE, FALSE, FALSE, FALSE, NULL, 'men', 'hoodies'),
    ('Burberry Heritage Trench Coat', 'burberry-heritage-trench-coat', 'Iconic Burberry trench coat in honey. Double-breasted with epaulettes, gun flap, and signature check lining.', 'Burberry', 'BRB-JK-001', 2890.00, NULL, NULL, 10, 4.9, 201, TRUE, TRUE, FALSE, FALSE, NULL, 'men', 'jackets'),
    ('Nike Air Max 270 React', 'nike-air-max-270-react', 'Nike Air Max 270 React with large Air unit and React foam sole. Breathable mesh upper with synthetic overlays.', 'Nike', 'NKE-SN-001', 175.00, 200.00, 13, 120, 4.4, 356, FALSE, TRUE, TRUE, TRUE, '2026-07-31 23:59:59', 'men', 'sneakers'),
    ('Chanel Little Black Dress', 'chanel-little-black-dress', 'Timeless Chanel LBD in black silk crepe. Boat neckline, three-quarter sleeves, and signature chain hem detailing.', 'Chanel', 'CHA-DR-001', 4500.00, NULL, NULL, 5, 4.9, 87, TRUE, TRUE, FALSE, FALSE, NULL, 'women', 'dresses'),
    ('Gucci GG Marmont Matelassé Bag', 'gucci-gg-marmont-matelasse-bag', 'GG Marmont shoulder bag in chevron matelassé leather. Gold-toned GG logo hardware and chain strap with leather shoulder pad.', 'Gucci', 'GUC-BG-001', 2980.00, NULL, NULL, 20, 4.8, 173, TRUE, TRUE, FALSE, FALSE, NULL, 'women', 'handbags'),
    ('Christian Louboutin So Kate Heels', 'christian-louboutin-so-kate-heels', 'So Kate 120mm stiletto pumps in black patent leather. Signature red lacquered sole and pointed toe.', 'Christian Louboutin', 'CL-HE-001', 795.00, 845.00, 6, 30, 4.6, 94, TRUE, FALSE, FALSE, TRUE, '2026-08-15 23:59:59', 'women', 'heels'),
    ('Rolex Submariner Date', 'rolex-submariner-date', 'Oystersteel Submariner Date with Cerachrom bezel and black dial. Automatic movement with date display and Cyclops lens.', 'Rolex', 'RLX-WT-001', 15500.00, NULL, NULL, 3, 5.0, 312, TRUE, TRUE, FALSE, FALSE, NULL, 'watches', 'luxury-watches'),
    ('Apple Watch Ultra 2', 'apple-watch-ultra-2', 'Apple Watch Ultra 2 with 49mm titanium case. Precision dual-frequency GPS, Action button, and 36hr battery life.', 'Apple', 'APL-WT-002', 799.00, NULL, NULL, 45, 4.7, 268, FALSE, TRUE, TRUE, FALSE, NULL, 'watches', 'smart-watches'),
    ('Hermès Birkin 30', 'hermes-birkin-30', 'Birkin 30 handbag in Togo leather with gold hardware. Hand-stitched with signature turn-lock closure and clochette.', 'Hermès', 'HER-BG-002', 12000.00, NULL, NULL, 2, 5.0, 189, TRUE, TRUE, FALSE, FALSE, NULL, 'bags', 'handbags'),
    ('Prada Re-Nylon Backpack', 'prada-re-nylon-backpack', 'Prada Re-Nylon backpack in black. Made from regenerated nylon with enameled metal triangle logo and padded laptop compartment.', 'Prada', 'PRA-BP-001', 1450.00, NULL, NULL, 18, 4.5, 56, FALSE, TRUE, TRUE, FALSE, NULL, 'bags', 'backpacks'),
    ('Creed Aventus EDP 100ml', 'creed-aventus-edp', 'Creed Aventus eau de parfum. A bold blend of pineapple, blackcurrant, birch, and musk. Iconic luxury fragrance for men.', 'Creed', 'CRD-PF-001', 435.00, NULL, NULL, 60, 4.8, 421, TRUE, TRUE, FALSE, FALSE, NULL, 'perfumes', 'men-perfumes'),
    ('Chanel No. 5 EDP 100ml', 'chanel-no-5-edp', 'The legendary Chanel No. 5 eau de parfum. An abstract floral aldehyde bouquet with ylang-ylang, rose, and sandalwood.', 'Chanel', 'CHA-PF-002', 165.00, NULL, NULL, 80, 4.7, 503, FALSE, TRUE, FALSE, FALSE, NULL, 'perfumes', 'women-perfumes'),
    ('Tiffany Setting Engagement Ring', 'tiffany-setting-engagement-ring', 'Tiffany Setting ring in platinum with a round brilliant-cut diamond. Six-prong setting -- the world''s most iconic ring.', 'Tiffany & Co.', 'TIF-RG-001', 12500.00, NULL, NULL, 1, 5.0, 76, TRUE, FALSE, FALSE, FALSE, NULL, 'jewelry', 'rings'),
    ('Cartier Love Bracelet', 'cartier-love-bracelet', 'Iconic Cartier Love bracelet in 18k yellow gold. Oval design with screw motif and accompanying screwdriver.', 'Cartier', 'CAR-BR-001', 6700.00, NULL, NULL, 8, 4.9, 148, TRUE, TRUE, FALSE, FALSE, NULL, 'jewelry', 'bracelets'),
    ('La Mer Crème de la Mer 60ml', 'la-mer-creme-de-la-mer', 'The original Crème de la Mer moisturizer. Hand-harvested sea kelp fermented for 3-4 months for transformative skin renewal.', 'La Mer', 'LMR-SK-001', 545.00, NULL, NULL, 35, 4.6, 234, TRUE, FALSE, FALSE, FALSE, NULL, 'skincare', 'moisturizers'),
    ('Tom Ford Black Orchid Lipstick', 'tom-ford-black-orchid-lipstick', 'Tom Ford Lip Color in Black Orchid. Rich pigment with a satin finish in a luxurious gold metal case.', 'Tom Ford', 'TMF-LP-001', 62.00, NULL, NULL, 90, 4.3, 45, FALSE, FALSE, TRUE, FALSE, NULL, 'makeup', 'lipsticks'),
    ('Adidas Ultraboost Light', 'adidas-ultraboost-light', 'Adidas Ultraboost Light with Light BOOST midsole. Primeknit+ textile upper with Continental rubber outsole.', 'Adidas', 'ADI-RS-001', 190.00, 220.00, 14, 100, 4.5, 312, FALSE, TRUE, TRUE, TRUE, '2026-08-10 23:59:59', 'shoes', 'running-shoes'),
    ('Sony WH-1000XM5 Headphones', 'sony-wh-1000xm5-headphones', 'Industry-leading noise canceling headphones with 30-hour battery life. Hi-Res Audio with DSEE Extreme upscaling.', 'Sony', 'SNY-EA-001', 399.00, NULL, NULL, 40, 4.8, 567, TRUE, TRUE, FALSE, FALSE, NULL, 'electronics', 'earbuds'),
    ('Rimowa Essential Cabin Luggage', 'rimowa-essential-cabin', 'Essential Cabin suitcase in polycarbonate. Multiwheel system, TSA-approved lock, and flexible telescopic handle.', 'Rimowa', 'RIM-LG-001', 1400.00, NULL, NULL, 12, 4.6, 89, TRUE, TRUE, FALSE, FALSE, NULL, 'travel-accessories', 'luggage'),
    ('Gucci GG Marmont Belt', 'gucci-gg-marmont-belt', 'GG Marmont belt in black leather with gold-toned GG buckle. 40mm width, adjustable. Made in Italy.', 'Gucci', 'GUC-AC-002', 580.00, NULL, NULL, 55, 4.4, 102, FALSE, TRUE, FALSE, FALSE, NULL, 'fashion', 'accessories'),
    ('Dior Capture Totale Serum 30ml', 'dior-capture-totale-serum', 'Dior Capture Totale multi-perfection serum. Hyaluronic acid and iris extract to firm, brighten, and smooth skin.', 'Dior', 'DIO-SK-002', 290.00, NULL, NULL, 28, 4.5, 134, FALSE, FALSE, TRUE, FALSE, NULL, 'beauty', 'serum')
) AS v(name, slug, description, brand, sku, price, original_price, discount_percentage, stock, rating, total_reviews, featured, trending, is_new_arrival, is_on_sale, sale_end_date, category_slug, sub_slug)
JOIN categories c ON c.slug = v.category_slug
LEFT JOIN sub_categories sc ON sc.slug = v.sub_slug AND sc.category_id = c.id
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- Product images (keyed by product sku)
-- ============================================================

INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT p.id, v.image_url, v.is_primary, v.sort_order
FROM (VALUES
    ('GUC-TS-001', '/assets/products/gucci-signature-tshirt-1.jpg', TRUE, 1),
    ('GUC-TS-001', '/assets/products/gucci-signature-tshirt-2.jpg', FALSE, 2),
    ('PRA-SH-001', '/assets/products/prada-silk-shirt-1.jpg', TRUE, 1),
    ('DIE-JN-001', '/assets/products/diesel-struk-jeans-1.jpg', TRUE, 1),
    ('DIE-JN-001', '/assets/products/diesel-struk-jeans-2.jpg', FALSE, 2),
    ('LV-HD-001', '/assets/products/lv-monogram-hoodie-1.jpg', TRUE, 1),
    ('BRB-JK-001', '/assets/products/burberry-trench-1.jpg', TRUE, 1),
    ('BRB-JK-001', '/assets/products/burberry-trench-2.jpg', FALSE, 2),
    ('NKE-SN-001', '/assets/products/nike-airmax-270-1.jpg', TRUE, 1),
    ('CHA-DR-001', '/assets/products/chanel-lbd-1.jpg', TRUE, 1),
    ('GUC-BG-001', '/assets/products/gucci-marmont-bag-1.jpg', TRUE, 1),
    ('GUC-BG-001', '/assets/products/gucci-marmont-bag-2.jpg', FALSE, 2),
    ('CL-HE-001', '/assets/products/louboutin-so-kate-1.jpg', TRUE, 1),
    ('RLX-WT-001', '/assets/products/rolex-submariner-1.jpg', TRUE, 1),
    ('APL-WT-002', '/assets/products/apple-watch-ultra-2-1.jpg', TRUE, 1),
    ('HER-BG-002', '/assets/products/hermes-birkin-1.jpg', TRUE, 1),
    ('PRA-BP-001', '/assets/products/prada-backpack-1.jpg', TRUE, 1),
    ('PRA-BP-001', '/assets/products/prada-backpack-2.jpg', FALSE, 2),
    ('CRD-PF-001', '/assets/products/creed-aventus-1.jpg', TRUE, 1),
    ('CHA-PF-002', '/assets/products/chanel-no5-1.jpg', TRUE, 1),
    ('TIF-RG-001', '/assets/products/tiffany-ring-1.jpg', TRUE, 1),
    ('CAR-BR-001', '/assets/products/cartier-love-bracelet-1.jpg', TRUE, 1),
    ('LMR-SK-001', '/assets/products/la-mer-creme-1.jpg', TRUE, 1),
    ('TMF-LP-001', '/assets/products/tom-ford-lipstick-1.jpg', TRUE, 1),
    ('ADI-RS-001', '/assets/products/adidas-ultraboost-1.jpg', TRUE, 1),
    ('ADI-RS-001', '/assets/products/adidas-ultraboost-2.jpg', FALSE, 2),
    ('SNY-EA-001', '/assets/products/sony-xm5-1.jpg', TRUE, 1),
    ('RIM-LG-001', '/assets/products/rimowa-essential-1.jpg', TRUE, 1),
    ('GUC-AC-002', '/assets/products/gucci-marmont-belt-1.jpg', TRUE, 1),
    ('DIO-SK-002', '/assets/products/dior-serum-1.jpg', TRUE, 1)
) AS v(sku, image_url, is_primary, sort_order)
JOIN products p ON p.sku = v.sku
ON CONFLICT (product_id, image_url) DO NOTHING;

-- ============================================================
-- Product variants (keyed by product sku)
-- ============================================================

INSERT INTO product_variants (product_id, size, color, stock, price_override, sku)
SELECT p.id, v.size, v.color, v.stock, v.price_override::numeric, v.sku
FROM (VALUES
    ('GUC-TS-001', 'S', 'White', 10, NULL, 'GUC-TS-001-SW'),
    ('GUC-TS-001', 'M', 'White', 15, NULL, 'GUC-TS-001-MW'),
    ('GUC-TS-001', 'L', 'White', 12, NULL, 'GUC-TS-001-LW'),
    ('GUC-TS-001', 'S', 'Black', 8, NULL, 'GUC-TS-001-SB'),
    ('GUC-TS-001', 'M', 'Black', 12, NULL, 'GUC-TS-001-MB'),
    ('GUC-TS-001', 'L', 'Black', 10, NULL, 'GUC-TS-001-LB'),
    ('PRA-SH-001', 'S', 'White', 5, NULL, 'PRA-SH-001-SW'),
    ('PRA-SH-001', 'M', 'White', 8, NULL, 'PRA-SH-001-MW'),
    ('PRA-SH-001', 'L', 'White', 6, NULL, 'PRA-SH-001-LW'),
    ('PRA-SH-001', 'S', 'Navy', 4, NULL, 'PRA-SH-001-SN'),
    ('PRA-SH-001', 'M', 'Navy', 7, NULL, 'PRA-SH-001-MN'),
    ('PRA-SH-001', 'L', 'Navy', 5, NULL, 'PRA-SH-001-LN'),
    ('DIE-JN-001', '32', 'Blue', 15, NULL, 'DIE-JN-001-32B'),
    ('DIE-JN-001', '34', 'Blue', 20, NULL, 'DIE-JN-001-34B'),
    ('DIE-JN-001', '36', 'Blue', 12, NULL, 'DIE-JN-001-36B'),
    ('DIE-JN-001', '32', 'Black', 10, NULL, 'DIE-JN-001-32BL'),
    ('DIE-JN-001', '34', 'Black', 18, NULL, 'DIE-JN-001-34BL'),
    ('DIE-JN-001', '36', 'Black', 8, NULL, 'DIE-JN-001-36BL'),
    ('LV-HD-001', 'S', 'Brown', 3, NULL, 'LV-HD-001-SB'),
    ('LV-HD-001', 'M', 'Brown', 5, NULL, 'LV-HD-001-MB'),
    ('LV-HD-001', 'L', 'Brown', 4, NULL, 'LV-HD-001-LB'),
    ('NKE-SN-001', '8', 'White', 10, NULL, 'NKE-SN-001-8W'),
    ('NKE-SN-001', '9', 'White', 15, NULL, 'NKE-SN-001-9W'),
    ('NKE-SN-001', '10', 'White', 12, NULL, 'NKE-SN-001-10W'),
    ('NKE-SN-001', '8', 'Black', 8, NULL, 'NKE-SN-001-8B'),
    ('NKE-SN-001', '9', 'Black', 14, NULL, 'NKE-SN-001-9B'),
    ('NKE-SN-001', '10', 'Black', 10, NULL, 'NKE-SN-001-10B'),
    ('CHA-DR-001', 'XS', 'Black', 2, NULL, 'CHA-DR-001-XSB'),
    ('CHA-DR-001', 'S', 'Black', 3, NULL, 'CHA-DR-001-SB'),
    ('CL-HE-001', '37', 'Black', 5, NULL, 'CL-HE-001-37B'),
    ('CL-HE-001', '38', 'Black', 8, NULL, 'CL-HE-001-38B'),
    ('CL-HE-001', '39', 'Black', 6, NULL, 'CL-HE-001-39B'),
    ('ADI-RS-001', '8', 'White', 20, NULL, 'ADI-RS-001-8W'),
    ('ADI-RS-001', '9', 'White', 25, NULL, 'ADI-RS-001-9W'),
    ('ADI-RS-001', '10', 'White', 18, NULL, 'ADI-RS-001-10W'),
    ('ADI-RS-001', '8', 'Black', 15, NULL, 'ADI-RS-001-8B'),
    ('ADI-RS-001', '9', 'Black', 22, NULL, 'ADI-RS-001-9B'),
    ('ADI-RS-001', '10', 'Black', 16, NULL, 'ADI-RS-001-10B'),
    ('GUC-AC-002', '90', 'Black', 20, NULL, 'GUC-AC-002-90B'),
    ('GUC-AC-002', '95', 'Black', 18, NULL, 'GUC-AC-002-95B'),
    ('GUC-AC-002', '90', 'Brown', 10, NULL, 'GUC-AC-002-90BR'),
    ('GUC-AC-002', '95', 'Brown', 7, NULL, 'GUC-AC-002-95BR')
) AS v(product_sku, size, color, stock, price_override, sku)
JOIN products p ON p.sku = v.product_sku
ON CONFLICT (sku) DO NOTHING;
