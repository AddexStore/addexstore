-- ============================================================
-- USERS
-- Password for all: password123 (BCrypt $2a$10$ hash)
-- ============================================================
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Alexander Mitchell', 'alex.mitchell@example.com', '$2a$10$Biw/ePOMsYtNdcoP22clgufuKJ1PX6Nin.2alEmNY3k4e2tbNLh3y', 'ADMIN'),
(2, 'Victoria Sterling', 'victoria@example.com', '$2a$10$Biw/ePOMsYtNdcoP22clgufuKJ1PX6Nin.2alEmNY3k4e2tbNLh3y', 'ADMIN'),
(3, 'John Smith', 'john@example.com', '$2a$10$Biw/ePOMsYtNdcoP22clgufuKJ1PX6Nin.2alEmNY3k4e2tbNLh3y', 'CUSTOMER'),
(4, 'Sarah Williams', 'sarah@example.com', '$2a$10$Biw/ePOMsYtNdcoP22clgufuKJ1PX6Nin.2alEmNY3k4e2tbNLh3y', 'CUSTOMER'),
(5, 'Michael Brown', 'michael@example.com', '$2a$10$Biw/ePOMsYtNdcoP22clgufuKJ1PX6Nin.2alEmNY3k4e2tbNLh3y', 'CUSTOMER');

-- ============================================================
-- CATEGORIES  (matching frontend data/categories.js)
-- ============================================================
INSERT IGNORE INTO categories (id, name, slug, description, icon, image, product_count) VALUES
(1,  'Men',    'men',    'Premium men''s fashion featuring tailored suits, casual wear, accessories, and footwear from world-class designers.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"/><path d="M19 5l-5.4 5.4"/><path d="M15 5h4v4"/></svg>',
     '/assets/placeholders/men.jpg', 42),
(2,  'Women',  'women',  'Curated women''s luxury collection from haute couture dresses to timeless accessories and exclusive designer pieces.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="M12 15v6"/><path d="M9 21h6"/></svg>',
     '/assets/placeholders/women.jpg', 38),
(3,  'Fashion','fashion','Trendsetting streetwear and contemporary fashion blends from avant-garde designers and luxury labels.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12l4 7-5 7-7-4-7 4-5-7 4-7z"/></svg>',
     '/assets/placeholders/fashion.jpg', 35),
(4,  'Shoes',  'shoes',  'Exquisite footwear collection from Italian leather loafers to limited-edition sneakers and elegant heels.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M3 18c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M2 22c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M4 10c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/></svg>',
     '/assets/placeholders/shoes.jpg', 28),
(5,  'Watches','watches','Haute horlogerie timepieces from Swiss masters including Rolex, Patek Philippe, Audemars Piguet and more.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2 2"/><path d="M10 2h4"/><path d="M11 22h2"/></svg>',
     '/assets/placeholders/watches.jpg', 22),
(6,  'Bags',   'bags',   'Luxury handbags and accessories from Hermès, Louis Vuitton, Chanel and other iconic fashion houses.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h16l-1.5 12H5.5L4 8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>',
     '/assets/placeholders/bags.jpg', 26),
(7,  'Perfumes','perfumes','Artisan-crafted fragrances from renowned perfumers featuring rare ingredients and exquisite blends.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M8 8h8v2a6 6 0 0 1-6 6h-4a2 2 0 0 1-2-2v-2a4 4 0 0 1 4-4z"/><path d="M8 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4"/></svg>',
     '/assets/placeholders/perfumes.jpg', 20),
(8,  'Beauty', 'beauty', 'Premium beauty and skincare essentials from La Mer, Sisley, and other luxury cosmetic houses.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M8 22v-4a4 4 0 0 1 8 0v4"/><path d="M4 12v10"/><path d="M20 12v10"/></svg>',
     '/assets/placeholders/beauty.jpg', 18),
(9,  'Makeup', 'makeup', 'Professional-grade makeup collections from Tom Ford, Charlotte Tilbury, and Dior Beauty.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2L6 14l4 4L22 6l-4-4z"/><path d="M10 14l-4 4"/><path d="M6 18l-2 4 4-2"/><circle cx="16" cy="8" r="1"/></svg>',
     '/assets/placeholders/makeup.jpg', 15),
(10, 'Skincare','skincare','Advanced clinical skincare featuring serums, moisturizers, and treatments from La Prairie and Dr. Barbara Sturm.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3z"/><path d="M12 6v8"/><path d="M8 14h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/></svg>',
     '/assets/placeholders/skincare.jpg', 16),
(11, 'Jewelry','jewelry','Fine jewelry collections from Cartier, Tiffany & Co., Van Cleef & Arpels with diamonds and precious gemstones.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 5-5 5 3 5-3 5"/><path d="M2 12h8"/><path d="M14 12h8"/><circle cx="12" cy="7" r="1"/><circle cx="12" cy="17" r="1"/></svg>',
     '/assets/placeholders/jewelry.jpg', 24),
(12, 'Sports', 'sports', 'Premium sportswear and equipment from Nike, Adidas, and performance luxury brands.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 0 0 20 15 15 0 0 0 0-20z"/><path d="M2 12h20"/></svg>',
     '/assets/placeholders/sports.jpg', 14),
(13, 'Electronics','electronics','Cutting-edge luxury electronics from Bang & Olufsen, Apple, and high-end audio brands.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M12 18h.01"/></svg>',
     '/assets/placeholders/electronics.jpg', 12),
(14, 'Travel Accessories','travel-accessories','Refined travel essentials from Rimowa, Tumi, and Bric''s for the discerning global traveler.',
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18v14H3z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>',
     '/assets/placeholders/travel.jpg', 10);

-- ============================================================
-- SUB-CATEGORIES
-- ============================================================
-- Men (1)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(101, 'T-Shirts',      't-shirts',       5, 1),
(102, 'Shirts',        'shirts',         5, 1),
(103, 'Jeans',         'jeans',          4, 1),
(104, 'Hoodies',       'hoodies',        4, 1),
(105, 'Jackets',       'jackets',        4, 1),
(106, 'Sneakers',      'sneakers',       5, 1),
(107, 'Formal Shoes',  'formal-shoes',   4, 1),
(108, 'Watches',       'watches',        4, 1),
(109, 'Wallets',       'wallets',        3, 1),
(110, 'Accessories',   'accessories',    4, 1);

-- Women (2)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(201, 'Dresses',   'dresses',   6, 2),
(202, 'Tops',      'tops',      5, 2),
(203, 'Jeans',     'jeans',     4, 2),
(204, 'Handbags',  'handbags',  5, 2),
(205, 'Heels',     'heels',     4, 2),
(206, 'Makeup',    'makeup',    5, 2),
(207, 'Jewelry',   'jewelry',   4, 2),
(208, 'Skincare',  'skincare',  5, 2);

-- Fashion (3)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(301, 'T-Shirts',    't-shirts',    6, 3),
(302, 'Shirts',      'shirts',      5, 3),
(303, 'Jeans',       'jeans',       5, 3),
(304, 'Hoodies',     'hoodies',     4, 3),
(305, 'Jackets',     'jackets',     4, 3),
(306, 'Shoes',       'shoes',       6, 3),
(307, 'Accessories', 'accessories', 5, 3);

-- Shoes (4)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(401, 'Sneakers',     'sneakers',      7, 4),
(402, 'Running Shoes','running-shoes', 6, 4),
(403, 'Formal Shoes', 'formal-shoes',  5, 4),
(404, 'Sandals',      'sandals',       4, 4),
(405, 'Sports Shoes', 'sports-shoes',  6, 4);

-- Watches (5)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(501, 'Luxury Watches','luxury-watches', 9, 5),
(502, 'Smart Watches', 'smart-watches',  7, 5),
(503, 'Sports Watches','sports-watches', 6, 5);

-- Bags (6)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(601, 'Backpacks',   'backpacks',    7, 6),
(602, 'Handbags',    'handbags',     8, 6),
(603, 'Laptop Bags', 'laptop-bags',  5, 6),
(604, 'Travel Bags', 'travel-bags',  6, 6);

-- Perfumes (7)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(701, 'Men Perfumes',    'men-perfumes',    6, 7),
(702, 'Women Perfumes',  'women-perfumes',  6, 7),
(703, 'Luxury Fragrances','luxury-fragrances',5, 7),
(704, 'Body Sprays',     'body-sprays',     3, 7);

-- Beauty (8)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(801, 'Lipsticks', 'lipsticks', 3, 8),
(802, 'Foundation','foundation',3, 8),
(803, 'Face Wash', 'face-wash', 3, 8),
(804, 'Serum',     'serum',     3, 8),
(805, 'Perfumes',  'perfumes',  3, 8),
(806, 'Hair Care', 'hair-care', 2, 8),
(807, 'Skin Care', 'skin-care', 1, 8);

-- Makeup (9)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(901, 'Lipsticks',  'lipsticks',   3, 9),
(902, 'Brushes',    'brushes',     3, 9),
(903, 'Foundation', 'foundation',  3, 9),
(904, 'Kits',       'kits',        3, 9),
(905, 'Eye Makeup', 'eye-makeup',  3, 9);

-- Skincare (10)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(1001, 'Face Wash',    'face-wash',    4, 10),
(1002, 'Serums',       'serums',       4, 10),
(1003, 'Moisturizers', 'moisturizers', 3, 10),
(1004, 'Sunscreen',    'sunscreen',    3, 10),
(1005, 'Masks',        'masks',        2, 10);

-- Jewelry (11)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(1101, 'Rings',     'rings',     7, 11),
(1102, 'Bracelets', 'bracelets', 6, 11),
(1103, 'Necklaces', 'necklaces', 6, 11),
(1104, 'Earrings',  'earrings',  5, 11);

-- Sports (12)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(1201, 'Gym Bags',      'gym-bags',      3, 12),
(1202, 'Dumbbells',     'dumbbells',     3, 12),
(1203, 'Water Bottles', 'water-bottles', 2, 12),
(1204, 'Sports Shoes',  'sports-shoes',  4, 12),
(1205, 'Accessories',   'accessories',   2, 12);

-- Electronics (13)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(1301, 'Smartphones',  'smartphones',   3, 13),
(1302, 'Earbuds',      'earbuds',       3, 13),
(1303, 'Smart Watches','smart-watches', 2, 13),
(1304, 'Chargers',     'chargers',      2, 13),
(1305, 'Accessories',  'accessories',   2, 13);

-- Travel Accessories (14)
INSERT IGNORE INTO sub_categories (id, name, slug, product_count, category_id) VALUES
(1401, 'Backpacks',        'backpacks',        2, 14),
(1402, 'Luggage',          'luggage',          3, 14),
(1403, 'Passport Holders', 'passport-holders', 2, 14),
(1404, 'Travel Pillows',   'travel-pillows',   1, 14),
(1405, 'Travel Organizers','travel-organizers',2, 14);

-- ============================================================
-- PRODUCTS  (24 products across categories)
-- ============================================================
INSERT IGNORE INTO products (id, name, slug, description, brand, sku, price, original_price, discount_percentage, stock, rating, total_reviews, featured, trending, is_new_arrival, is_on_sale, sale_end_date, category_id, sub_category_id) VALUES
(1,  'Gucci Signature Cotton T-Shirt',    'gucci-signature-cotton-tshirt',    'Iconic Gucci cotton t-shirt with signature branding. Crafted from premium Italian cotton with a relaxed fit.',               'Gucci',            'GUC-TS-001',   450.00,  550.00, 18,  50, 4.5, 128, TRUE,  TRUE,  FALSE, TRUE,  '2026-08-31 23:59:59', 1, 101),
(2,  'Prada Milano Silk Shirt',           'prada-milano-silk-shirt',          'Luxurious Prada silk shirt, tailored in Milan. Features a classic spread collar and mother-of-pearl buttons.',               'Prada',            'PRA-SH-001',   1200.00, NULL,    NULL, 25, 4.7, 64,  FALSE, TRUE,  FALSE, FALSE, NULL,                   1, 102),
(3,  'Diesel D-Struk Straight Jeans',     'diesel-d-struk-straight-jeans',    'Straight-leg jeans with distressed detailing and Diesel branding. Made from heavyweight Japanese denim.',                    'Diesel',           'DIE-JN-001',   280.00,  350.00, 20,  80, 4.2, 47,  FALSE, FALSE, TRUE,  TRUE,  '2026-07-15 23:59:59', 1, 103),
(4,  'Louis Vuitton Monogram Hoodie',     'louis-vuitton-monogram-hoodie',    'Oversized fleece hoodie with LV Monogram jacquard pattern. Ribbed cuffs and hem with adjustable drawstring hood.',            'Louis Vuitton',    'LV-HD-001',    1850.00, NULL,    NULL, 15, 4.8, 92,  TRUE,  FALSE, FALSE, FALSE, NULL,                   1, 104),
(5,  'Burberry Heritage Trench Coat',     'burberry-heritage-trench-coat',    'Iconic Burberry trench coat in honey. Double-breasted with epaulettes, gun flap, and signature check lining.',               'Burberry',         'BRB-JK-001',   2890.00, NULL,    NULL, 10, 4.9, 201, TRUE,  TRUE,  FALSE, FALSE, NULL,                   1, 105),
(6,  'Nike Air Max 270 React',           'nike-air-max-270-react',           'Nike Air Max 270 React with large Air unit and React foam sole. Breathable mesh upper with synthetic overlays.',             'Nike',             'NKE-SN-001',   175.00,  200.00, 13,  120, 4.4, 356, FALSE, TRUE,  TRUE,  TRUE,  '2026-07-31 23:59:59', 1, 106),
(7,  'Chanel Little Black Dress',         'chanel-little-black-dress',        'Timeless Chanel LBD in black silk crepe. Boat neckline, three-quarter sleeves, and signature chain hem detailing.',           'Chanel',           'CHA-DR-001',   4500.00, NULL,    NULL, 5,  4.9, 87,  TRUE,  TRUE,  FALSE, FALSE, NULL,                   2, 201),
(8,  'Gucci GG Marmont Matelassé Bag',   'gucci-gg-marmont-matelasse-bag',   'GG Marmont shoulder bag in chevron matelassé leather. Gold-toned GG logo hardware and chain strap with leather shoulder pad.', 'Gucci',            'GUC-BG-001',   2980.00, NULL,    NULL, 20, 4.8, 173, TRUE,  TRUE,  FALSE, FALSE, NULL,                   2, 204),
(9,  'Christian Louboutin So Kate Heels', 'christian-louboutin-so-kate-heels', 'So Kate 120mm stiletto pumps in black patent leather. Signature red lacquered sole and pointed toe.',                          'Christian Louboutin','CL-HE-001',  795.00,  845.00, 6,   30, 4.6, 94,  TRUE,  FALSE, FALSE, TRUE,  '2026-08-15 23:59:59', 2, 205),
(10, 'Rolex Submariner Date',             'rolex-submariner-date',            'Oystersteel Submariner Date with Cerachrom bezel and black dial. Automatic movement with date display and Cyclops lens.',     'Rolex',            'RLX-WT-001',   15500.00, NULL,   NULL, 3,  5.0, 312, TRUE,  TRUE,  FALSE, FALSE, NULL,                   5, 501),
(11, 'Apple Watch Ultra 2',              'apple-watch-ultra-2',              'Apple Watch Ultra 2 with 49mm titanium case. Precision dual-frequency GPS, Action button, and 36hr battery life.',           'Apple',            'APL-WT-002',   799.00,  NULL,   NULL, 45, 4.7, 268, FALSE, TRUE,  TRUE,  FALSE, NULL,                   5, 502),
(12, 'Hermès Birkin 30',                 'hermes-birkin-30',                 'Birkin 30 handbag in Togo leather with gold hardware. Hand-stitched with signature turn-lock closure and clochette.',        'Hermès',           'HER-BG-002',   12000.00, NULL,  NULL, 2,  5.0, 189, TRUE,  TRUE,  FALSE, FALSE, NULL,                   6, 602),
(13, 'Prada Re-Nylon Backpack',          'prada-re-nylon-backpack',          'Prada Re-Nylon backpack in black. Made from regenerated nylon with enameled metal triangle logo and padded laptop compartment.', 'Prada',           'PRA-BP-001',   1450.00, NULL,   NULL, 18, 4.5, 56,  FALSE, TRUE,  TRUE,  FALSE, NULL,                   6, 601),
(14, 'Creed Aventus EDP 100ml',          'creed-aventus-edp',                'Creed Aventus eau de parfum. A bold blend of pineapple, blackcurrant, birch, and musk. Iconic luxury fragrance for men.',     'Creed',            'CRD-PF-001',   435.00,  NULL,   NULL, 60, 4.8, 421, TRUE,  TRUE,  FALSE, FALSE, NULL,                   7, 701),
(15, 'Chanel No. 5 EDP 100ml',           'chanel-no-5-edp',                  'The legendary Chanel No. 5 eau de parfum. An abstract floral aldehyde bouquet with ylang-ylang, rose, and sandalwood.',      'Chanel',           'CHA-PF-002',   165.00,  NULL,   NULL, 80, 4.7, 503, FALSE, TRUE,  FALSE, FALSE, NULL,                   7, 702),
(16, 'Tiffany Setting Engagement Ring',   'tiffany-setting-engagement-ring',  'Tiffany Setting ring in platinum with a round brilliant-cut diamond. Six-prong setting — the world''s most iconic ring.',   'Tiffany & Co.',    'TIF-RG-001',   12500.00, NULL,  NULL, 1,  5.0, 76,  TRUE,  FALSE, FALSE, FALSE, NULL,                   11, 1101),
(17, 'Cartier Love Bracelet',            'cartier-love-bracelet',             'Iconic Cartier Love bracelet in 18k yellow gold. Oval design with screw motif and accompanying screwdriver.',                'Cartier',          'CAR-BR-001',   6700.00,  NULL,   NULL, 8,  4.9, 148, TRUE,  TRUE,  FALSE, FALSE, NULL,                   11, 1102),
(18, 'La Mer Crème de la Mer 60ml',      'la-mer-creme-de-la-mer',           'The original Crème de la Mer moisturizer. Hand-harvested sea kelp fermented for 3-4 months for transformative skin renewal.',  'La Mer',           'LMR-SK-001',   545.00,  NULL,   NULL, 35, 4.6, 234, TRUE,  FALSE, FALSE, FALSE, NULL,                   10, 1003),
(19, 'Tom Ford Black Orchid Lipstick',   'tom-ford-black-orchid-lipstick',   'Tom Ford Lip Color in Black Orchid. Rich pigment with a satin finish in a luxurious gold metal case.',                        'Tom Ford',         'TMF-LP-001',   62.00,   NULL,   NULL, 90, 4.3, 45,  FALSE, FALSE, TRUE,  FALSE, NULL,                   9, 901),
(20, 'Adidas Ultraboost Light',          'adidas-ultraboost-light',          'Adidas Ultraboost Light with Light BOOST midsole. Primeknit+ textile upper with Continental rubber outsole.',                  'Adidas',           'ADI-RS-001',   190.00,  220.00, 14,  100, 4.5, 312, FALSE, TRUE,  TRUE,  TRUE,  '2026-08-10 23:59:59', 4, 402),
(21, 'Sony WH-1000XM5 Headphones',       'sony-wh-1000xm5-headphones',       'Industry-leading noise canceling headphones with 30-hour battery life. Hi-Res Audio with DSEE Extreme upscaling.',             'Sony',             'SNY-EA-001',   399.00,  NULL,   NULL, 40, 4.8, 567, TRUE,  TRUE,  FALSE, FALSE, NULL,                   13, 1302),
(22, 'Rimowa Essential Cabin Luggage',   'rimowa-essential-cabin',           'Essential Cabin suitcase in polycarbonate. Multiwheel system, TSA-approved lock, and flexible telescopic handle.',           'Rimowa',           'RIM-LG-001',   1400.00, NULL,   NULL, 12, 4.6, 89,  TRUE,  TRUE,  FALSE, FALSE, NULL,                   14, 1402),
(23, 'Gucci GG Marmont Belt',            'gucci-gg-marmont-belt',            'GG Marmont belt in black leather with gold-toned GG buckle. 40mm width, adjustable. Made in Italy.',                          'Gucci',            'GUC-AC-002',   580.00,  NULL,   NULL, 55, 4.4, 102, FALSE, TRUE,  FALSE, FALSE, NULL,                   3, 307),
(24, 'Dior Capture Totale Serum 30ml',   'dior-capture-totale-serum',        'Dior Capture Totale multi-perfection serum. Hyaluronic acid and iris extract to firm, brighten, and smooth skin.',            'Dior',             'DIO-SK-002',   290.00,  NULL,   NULL, 28, 4.5, 134, FALSE, FALSE, TRUE,  FALSE, NULL,                   8, 804);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
INSERT IGNORE INTO product_images (id, product_id, image_url, is_primary, sort_order) VALUES
(1,  1,  '/assets/products/gucci-signature-tshirt-1.jpg',   TRUE,  1),
(2,  1,  '/assets/products/gucci-signature-tshirt-2.jpg',   FALSE, 2),
(3,  2,  '/assets/products/prada-silk-shirt-1.jpg',         TRUE,  1),
(4,  3,  '/assets/products/diesel-struk-jeans-1.jpg',       TRUE,  1),
(5,  3,  '/assets/products/diesel-struk-jeans-2.jpg',       FALSE, 2),
(6,  4,  '/assets/products/lv-monogram-hoodie-1.jpg',       TRUE,  1),
(7,  5,  '/assets/products/burberry-trench-1.jpg',          TRUE,  1),
(8,  5,  '/assets/products/burberry-trench-2.jpg',          FALSE, 2),
(9,  6,  '/assets/products/nike-airmax-270-1.jpg',          TRUE,  1),
(10, 7,  '/assets/products/chanel-lbd-1.jpg',               TRUE,  1),
(11, 8,  '/assets/products/gucci-marmont-bag-1.jpg',        TRUE,  1),
(12, 8,  '/assets/products/gucci-marmont-bag-2.jpg',        FALSE, 2),
(13, 9,  '/assets/products/louboutin-so-kate-1.jpg',        TRUE,  1),
(14, 10, '/assets/products/rolex-submariner-1.jpg',         TRUE,  1),
(15, 11, '/assets/products/apple-watch-ultra-2-1.jpg',      TRUE,  1),
(16, 12, '/assets/products/hermes-birkin-1.jpg',            TRUE,  1),
(17, 13, '/assets/products/prada-backpack-1.jpg',           TRUE,  1),
(18, 13, '/assets/products/prada-backpack-2.jpg',           FALSE, 2),
(19, 14, '/assets/products/creed-aventus-1.jpg',            TRUE,  1),
(20, 15, '/assets/products/chanel-no5-1.jpg',               TRUE,  1),
(21, 16, '/assets/products/tiffany-ring-1.jpg',             TRUE,  1),
(22, 17, '/assets/products/cartier-love-bracelet-1.jpg',    TRUE,  1),
(23, 18, '/assets/products/la-mer-creme-1.jpg',             TRUE,  1),
(24, 19, '/assets/products/tom-ford-lipstick-1.jpg',        TRUE,  1),
(25, 20, '/assets/products/adidas-ultraboost-1.jpg',        TRUE,  1),
(26, 20, '/assets/products/adidas-ultraboost-2.jpg',        FALSE, 2),
(27, 21, '/assets/products/sony-xm5-1.jpg',                 TRUE,  1),
(28, 22, '/assets/products/rimowa-essential-1.jpg',         TRUE,  1),
(29, 23, '/assets/products/gucci-marmont-belt-1.jpg',       TRUE,  1),
(30, 24, '/assets/products/dior-serum-1.jpg',               TRUE,  1);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
INSERT IGNORE INTO product_variants (id, product_id, size, color, stock, price_override, sku) VALUES
(1,  1,  'S',  'White',  10, NULL, 'GUC-TS-001-SW'),
(2,  1,  'M',  'White',  15, NULL, 'GUC-TS-001-MW'),
(3,  1,  'L',  'White',  12, NULL, 'GUC-TS-001-LW'),
(4,  1,  'S',  'Black',  8,  NULL, 'GUC-TS-001-SB'),
(5,  1,  'M',  'Black',  12, NULL, 'GUC-TS-001-MB'),
(6,  1,  'L',  'Black',  10, NULL, 'GUC-TS-001-LB'),
(7,  2,  'S',  'White',  5,  NULL, 'PRA-SH-001-SW'),
(8,  2,  'M',  'White',  8,  NULL, 'PRA-SH-001-MW'),
(9,  2,  'L',  'White',  6,  NULL, 'PRA-SH-001-LW'),
(10, 2,  'S',  'Navy',   4,  NULL, 'PRA-SH-001-SN'),
(11, 2,  'M',  'Navy',   7,  NULL, 'PRA-SH-001-MN'),
(12, 2,  'L',  'Navy',   5,  NULL, 'PRA-SH-001-LN'),
(13, 3,  '32', 'Blue',   15, NULL, 'DIE-JN-001-32B'),
(14, 3,  '34', 'Blue',   20, NULL, 'DIE-JN-001-34B'),
(15, 3,  '36', 'Blue',   12, NULL, 'DIE-JN-001-36B'),
(16, 3,  '32', 'Black',  10, NULL, 'DIE-JN-001-32BL'),
(17, 3,  '34', 'Black',  18, NULL, 'DIE-JN-001-34BL'),
(18, 3,  '36', 'Black',  8,  NULL, 'DIE-JN-001-36BL'),
(19, 4,  'S',  'Brown',  3,  NULL, 'LV-HD-001-SB'),
(20, 4,  'M',  'Brown',  5,  NULL, 'LV-HD-001-MB'),
(21, 4,  'L',  'Brown',  4,  NULL, 'LV-HD-001-LB'),
(22, 6,  '8',  'White',  10, NULL, 'NKE-SN-001-8W'),
(23, 6,  '9',  'White',  15, NULL, 'NKE-SN-001-9W'),
(24, 6,  '10', 'White',  12, NULL, 'NKE-SN-001-10W'),
(25, 6,  '8',  'Black',  8,  NULL, 'NKE-SN-001-8B'),
(26, 6,  '9',  'Black',  14, NULL, 'NKE-SN-001-9B'),
(27, 6,  '10', 'Black',  10, NULL, 'NKE-SN-001-10B'),
(28, 7,  'XS', 'Black',  2,  NULL, 'CHA-DR-001-XSB'),
(29, 7,  'S',  'Black',  3,  NULL, 'CHA-DR-001-SB'),
(30, 9,  '37', 'Black',  5,  NULL, 'CL-HE-001-37B'),
(31, 9,  '38', 'Black',  8,  NULL, 'CL-HE-001-38B'),
(32, 9,  '39', 'Black',  6,  NULL, 'CL-HE-001-39B'),
(33, 20, '8',  'White',  20, NULL, 'ADI-RS-001-8W'),
(34, 20, '9',  'White',  25, NULL, 'ADI-RS-001-9W'),
(35, 20, '10', 'White',  18, NULL, 'ADI-RS-001-10W'),
(36, 20, '8',  'Black',  15, NULL, 'ADI-RS-001-8B'),
(37, 20, '9',  'Black',  22, NULL, 'ADI-RS-001-9B'),
(38, 20, '10', 'Black',  16, NULL, 'ADI-RS-001-10B'),
(39, 23, '90', 'Black',  20, NULL, 'GUC-AC-002-90B'),
(40, 23, '95', 'Black',  18, NULL, 'GUC-AC-002-95B'),
(41, 23, '90', 'Brown',  10, NULL, 'GUC-AC-002-90BR'),
(42, 23, '95', 'Brown',  7,  NULL, 'GUC-AC-002-95BR');

-- ============================================================
-- BANNERS
-- ============================================================
INSERT IGNORE INTO banners (id, title, subtitle, cta, cta_link, bg_color, image, sort_order, active) VALUES
(1, 'Summer Collection 2026',   'Discover the season''s most coveted pieces from top luxury brands.',     'Shop Now',    '/category/summer',     '#1a1a2e', '/assets/banners/summer.jpg',   1, TRUE),
(2, 'Luxury Watches Sale',      'Up to 30% off on premium Swiss timepieces. Limited time.',               'Explore',     '/category/watches',     '#16213e', '/assets/banners/watches.jpg',  2, TRUE),
(3, 'New Arrivals',             'Be the first to own the latest drops from Gucci, Prada & more.',         'View New',    '/new-arrivals',        '#0f3460', '/assets/banners/new.jpg',      3, TRUE),
(4, 'Designer Bags Collection', 'Curated selection of iconic handbags. Express shipping worldwide.',       'Shop Bags',   '/category/bags',        '#533483', '/assets/banners/bags.jpg',      4, TRUE),
(5, 'Fine Jewelry',             'Exquisite diamond and gold pieces for life''s special moments.',           'Discover',    '/category/jewelry',     '#e94560', '/assets/banners/jewelry.jpg',   5, TRUE);

-- ============================================================
-- SETTINGS
-- ============================================================
-- Settings seeded in V5
