UPDATE tax_rules SET rate = 8.00, name = 'US Tax (Default 8%)' WHERE country = 'US' AND state IS NULL AND rate = 0.00;
