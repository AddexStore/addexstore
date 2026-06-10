DELETE FROM products;

UPDATE categories SET product_count = 0;
UPDATE sub_categories SET product_count = 0;

SELECT setval('products_id_seq', 1, false);
SELECT setval('product_images_id_seq', 1, false);
SELECT setval('product_variants_id_seq', 1, false);
