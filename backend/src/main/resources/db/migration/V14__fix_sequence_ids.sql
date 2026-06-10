SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM categories));
SELECT setval('sub_categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM sub_categories));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products));
SELECT setval('product_images_id_seq', (SELECT COALESCE(MAX(id), 0) FROM product_images));
SELECT setval('product_variants_id_seq', (SELECT COALESCE(MAX(id), 0) FROM product_variants));
SELECT setval('banners_id_seq', (SELECT COALESCE(MAX(id), 0) FROM banners));
