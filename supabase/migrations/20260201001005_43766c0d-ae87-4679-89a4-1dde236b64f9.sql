-- Add White Wine products to all wine/liquor stores
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'd2b6bf49-0f84-413b-a749-f09d7ff4904f', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('Sauvignon Blanc 750ml', 'Crisp white wine with citrus notes', 189.99, 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400'),
    ('Chardonnay 750ml', 'Full-bodied white with oak undertones', 210.00, 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400'),
    ('Pinot Grigio 750ml', 'Light and refreshing Italian white', 175.00, 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=400'),
    ('Chenin Blanc 750ml', 'South African white with tropical fruit', 145.00, 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND (s.name LIKE '%Wine%' OR s.name LIKE '%Bottle%' OR s.name LIKE '%Elohim%');

-- Add Laundry & Home Care products to all Shoprite stores
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '03a92592-667a-48fa-8b3a-3fc17c30ae55', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('OMO Washing Powder 2kg', 'Premium laundry detergent for bright whites', 89.99, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400'),
    ('Sunlight Dishwashing Liquid 750ml', 'Tough on grease, gentle on hands', 34.99, 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400'),
    ('Domestos Bleach 750ml', 'Kills 99.9% of germs and bacteria', 29.99, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400'),
    ('Handy Andy All Purpose Cleaner 750ml', 'Multi-surface cleaning power', 32.99, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'),
    ('Sta-Soft Fabric Softener 2L', 'Long-lasting freshness for your clothes', 45.99, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Shoprite%';

-- Add Personal Care products to all Shoprite stores
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'a8873067-30ca-45ab-8cd5-6d0a59ddf21f', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('Colgate Toothpaste 100ml', 'Cavity protection and fresh breath', 24.99, 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400'),
    ('Dove Soap Bar 100g', 'Moisturizing beauty bar', 19.99, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400'),
    ('Nivea Body Lotion 400ml', 'Deep moisturizing for dry skin', 54.99, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),
    ('Pantene Shampoo 400ml', 'Strong and shiny hair care', 69.99, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400'),
    ('Gillette Disposable Razors 5-Pack', 'Smooth shaving experience', 39.99, 'https://images.unsplash.com/photo-1585652757173-57de5e8baa37?w=400'),
    ('Vaseline Petroleum Jelly 250ml', 'Multi-purpose skin protection', 29.99, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Shoprite%';

-- Add Bakery products to all Shoprite stores (existing may only have 2-4 items)
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '26ff06b5-82ab-4a1f-9159-e45fcc263256', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('White Bread Loaf', 'Fresh daily baked white bread', 14.99, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400'),
    ('Brown Bread Loaf', 'Whole wheat nutritious bread', 16.99, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
    ('Croissants 4-Pack', 'Buttery French pastries', 34.99, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'),
    ('Danish Pastries 6-Pack', 'Assorted fruit-filled pastries', 44.99, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400'),
    ('Cheese Scones 6-Pack', 'Savoury cheese-flavoured scones', 29.99, 'https://images.unsplash.com/photo-1558303262-e1d87d5c0a4e?w=400'),
    ('Chelsea Buns 4-Pack', 'Sweet cinnamon spiral buns', 32.99, 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Shoprite%';

-- Add Bakery products to all Pick n Pay stores
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '26ff06b5-82ab-4a1f-9159-e45fcc263256', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('White Bread Loaf', 'Fresh daily baked white bread', 14.99, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400'),
    ('Brown Bread Loaf', 'Whole wheat nutritious bread', 16.99, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
    ('Croissants 4-Pack', 'Buttery French pastries', 34.99, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'),
    ('Muffins 6-Pack', 'Assorted flavour muffins', 39.99, 'https://images.unsplash.com/photo-1558303262-e1d87d5c0a4e?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Pick n Pay%';

-- Add Laundry & Personal Care to Pick n Pay too
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '03a92592-667a-48fa-8b3a-3fc17c30ae55', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('OMO Washing Powder 2kg', 'Premium laundry detergent', 89.99, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400'),
    ('Sunlight Dishwashing Liquid 750ml', 'Tough on grease', 34.99, 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400'),
    ('Domestos Bleach 750ml', 'Kills 99.9% of germs', 29.99, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Pick n Pay%';

INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'a8873067-30ca-45ab-8cd5-6d0a59ddf21f', p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (
  VALUES 
    ('Colgate Toothpaste 100ml', 'Cavity protection', 24.99, 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400'),
    ('Dove Soap Bar 100g', 'Moisturizing beauty bar', 19.99, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400'),
    ('Nivea Body Lotion 400ml', 'Deep moisturizing', 54.99, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400')
) AS p(name, description, price, image_url)
WHERE s.is_active = true AND s.name LIKE '%Pick n Pay%';