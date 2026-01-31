-- Add is_heavy flag to products for vehicle logic
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_heavy boolean DEFAULT false;

-- Add weight_kg for more precise vehicle suggestions
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT NULL;

-- Insert sample products across departments for all supermarkets
-- Get supermarket IDs and insert products

-- First, let's add products for Pantry & Staples category
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock, is_heavy, weight_kg)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock,
  p.is_heavy,
  p.weight_kg
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Mealie Meal 25kg', 'Premium white maize meal - Zambian staple', 289.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', true, 25.0),
    ('Mealie Meal 10kg', 'Breakfast mealie meal', 129.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', false, 10.0),
    ('Cooking Oil 5L', 'Pure sunflower cooking oil', 149.99, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', false, 5.0),
    ('White Rice 5kg', 'Long grain white rice', 89.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', false, 5.0),
    ('Sugar 2kg', 'White granulated sugar', 45.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', false, 2.0),
    ('Flour 2.5kg', 'All-purpose baking flour', 39.99, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', false, 2.5),
    ('Salt 1kg', 'Iodized table salt', 15.99, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400', false, 1.0),
    ('Canned Beans', 'Baked beans in tomato sauce 410g', 24.99, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', false, 0.5)
) AS p(name, description, price, image_url, is_heavy, weight_kg)
WHERE c.name = 'Pantry & Staples'
AND s.name IN ('Shoprite', 'Pick n Pay', 'Spar', 'Choppies')
ON CONFLICT DO NOTHING;

-- Dairy & Eggs products
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Fresh Milk 2L', 'Full cream fresh milk', 35.99, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'),
    ('Eggs 30 Pack', 'Farm fresh eggs - large', 89.99, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
    ('Cheddar Cheese 400g', 'Mature cheddar cheese block', 79.99, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400'),
    ('Yogurt 1kg', 'Plain creamy yogurt', 45.99, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
    ('Butter 500g', 'Salted butter', 69.99, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'),
    ('Margarine 500g', 'Stork margarine', 39.99, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Dairy & Eggs'
AND s.name IN ('Shoprite', 'Pick n Pay', 'Spar', 'Choppies')
ON CONFLICT DO NOTHING;

-- Butchery & Frozen products
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock, is_heavy, weight_kg)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock,
  p.is_heavy,
  p.weight_kg
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Beef Steak 1kg', 'Premium beef sirloin steak', 189.99, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', false, 1.0),
    ('Chicken Whole', 'Fresh whole chicken ~1.5kg', 89.99, 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400', false, 1.5),
    ('Pork Chops 1kg', 'Fresh pork loin chops', 149.99, 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', false, 1.0),
    ('Frozen Fish Fillets 800g', 'Hake fish fillets', 79.99, 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', false, 0.8),
    ('Beef Sausages 500g', 'Traditional beef sausages', 59.99, 'https://images.unsplash.com/photo-1601628828688-d920545ec926?w=400', false, 0.5),
    ('Mixed Frozen Vegetables 1kg', 'Garden mix vegetables', 49.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', false, 1.0)
) AS p(name, description, price, image_url, is_heavy, weight_kg)
WHERE c.name = 'Butchery & Frozen'
AND s.name IN ('Shoprite', 'Pick n Pay', 'Spar', 'Choppies')
ON CONFLICT DO NOTHING;

-- Beverages products
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock, is_heavy, weight_kg)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock,
  p.is_heavy,
  p.weight_kg
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Coca-Cola 2L', 'Classic Coca-Cola', 24.99, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', false, 2.0),
    ('Orange Juice 1L', 'Fresh squeezed orange juice', 35.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', false, 1.0),
    ('Bottled Water 6-Pack', '500ml spring water', 29.99, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', false, 3.0),
    ('Mazoe Orange 2L', 'Orange crush concentrate', 45.99, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', false, 2.0),
    ('Energy Drink 500ml', 'Red Bull energy drink', 29.99, 'https://images.unsplash.com/photo-1613477755937-5206db2c5c83?w=400', false, 0.5),
    ('Mineral Water 5L', 'Large mineral water bottle', 19.99, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', true, 5.0)
) AS p(name, description, price, image_url, is_heavy, weight_kg)
WHERE c.name = 'Beverages'
AND s.name IN ('Shoprite', 'Pick n Pay', 'Spar', 'Choppies')
ON CONFLICT DO NOTHING;

-- Baby Care products
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Pampers Diapers 50 Pack', 'Size 3 baby diapers', 199.99, 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=400'),
    ('Baby Wipes 80 Pack', 'Gentle baby wipes', 45.99, 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=400'),
    ('Baby Formula 900g', 'Infant formula milk', 289.99, 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=400'),
    ('Baby Cereal 250g', 'Rice cereal for babies', 49.99, 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=400'),
    ('Baby Lotion 400ml', 'Gentle moisturizing lotion', 59.99, 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Baby Care'
AND s.name IN ('Shoprite', 'Pick n Pay', 'Spar', 'Choppies')
ON CONFLICT DO NOTHING;

-- Hardware products for MicMar and Builders Warehouse
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock, is_heavy, weight_kg)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock,
  p.is_heavy,
  p.weight_kg
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Cement 50kg', 'Portland cement - CAR ONLY', 189.99, 'https://images.unsplash.com/photo-1518644730709-0835105d9daa?w=400', true, 50.0),
    ('Assorted Nails 5kg Box', 'Mixed sizes construction nails', 149.99, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true, 5.0),
    ('Hammer Claw', 'Heavy duty claw hammer', 89.99, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400', false, 1.0),
    ('PVC Pipes 3m Bundle', '50mm PVC pipes (5 pieces) - REQUIRES CAR', 299.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true, 8.0),
    ('Electrical Wire 100m', '2.5mm copper wire roll', 449.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', false, 3.0),
    ('Paint 20L', 'White emulsion wall paint - HEAVY', 399.99, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', true, 25.0)
) AS p(name, description, price, image_url, is_heavy, weight_kg)
WHERE c.name = 'Building Materials'
AND s.name ILIKE '%MicMar%' OR s.name ILIKE '%Builders%'
ON CONFLICT DO NOTHING;

-- Power Tools
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Power Drill', 'Cordless power drill 18V', 899.99, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
    ('Angle Grinder', '115mm angle grinder', 599.99, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
    ('Circular Saw', '7 inch circular saw', 1299.99, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
    ('Jigsaw', 'Variable speed jigsaw', 749.99, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
    ('Screwdriver Set', '32 piece screwdriver set', 199.99, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Power Tools'
AND (s.name ILIKE '%MicMar%' OR s.name ILIKE '%Builders%')
ON CONFLICT DO NOTHING;

-- Liquor store categories update - Add new liquor categories
INSERT INTO public.categories (name, icon) VALUES
  ('Lagers', '🍺'),
  ('Ciders', '🍎'),
  ('Red Wine', '🍷'),
  ('White Wine', '🥂'),
  ('Whiskey', '🥃'),
  ('Gin', '🍸'),
  ('Vodka', '🍶')
ON CONFLICT DO NOTHING;

-- Add liquor products
INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Mosi Lager 6-Pack', 'Zambian premium lager 330ml x 6', 89.99, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
    ('Castle Lager 12-Pack', 'South African lager 330ml x 12', 159.99, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
    ('Heineken 6-Pack', 'Premium import lager', 129.99, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Lagers'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Savanna Dry 6-Pack', 'Premium dry cider 330ml x 6', 99.99, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
    ('Hunters Gold 6-Pack', 'Golden cider 330ml x 6', 89.99, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
    ('Strongbow Apple', 'Apple cider 440ml', 35.99, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Ciders'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Cabernet Sauvignon', 'South African red wine 750ml', 189.99, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
    ('Merlot Reserve', 'Premium merlot 750ml', 249.99, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
    ('Shiraz', 'Full-bodied shiraz 750ml', 199.99, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
    ('Pinotage', 'South African pinotage 750ml', 179.99, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Red Wine'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Johnnie Walker Red', 'Blended Scotch whisky 750ml', 449.99, 'https://images.unsplash.com/photo-1527281400683-1aefee6bbd03?w=400'),
    ('Jack Daniels', 'Tennessee whiskey 750ml', 549.99, 'https://images.unsplash.com/photo-1527281400683-1aefee6bbd03?w=400'),
    ('Jameson Irish', 'Irish whiskey 750ml', 499.99, 'https://images.unsplash.com/photo-1527281400683-1aefee6bbd03?w=400'),
    ('Glenfiddich 12yr', 'Single malt Scotch 750ml', 899.99, 'https://images.unsplash.com/photo-1527281400683-1aefee6bbd03?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Whiskey'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Tanqueray Gin', 'London dry gin 750ml', 399.99, 'https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?w=400'),
    ('Hendricks Gin', 'Premium Scottish gin 750ml', 699.99, 'https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?w=400'),
    ('Bombay Sapphire', 'Vapor infused gin 750ml', 449.99, 'https://images.unsplash.com/photo-1514218953589-2d7d37efd2dc?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Gin'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  s.id as supermarket_id,
  c.id as category_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true as in_stock
FROM public.supermarkets s
CROSS JOIN public.categories c
CROSS JOIN (
  VALUES
    ('Smirnoff Vodka', 'Triple distilled vodka 750ml', 299.99, 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400'),
    ('Absolut Vodka', 'Swedish vodka 750ml', 349.99, 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400'),
    ('Grey Goose', 'Premium French vodka 750ml', 799.99, 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400')
) AS p(name, description, price, image_url)
WHERE c.name = 'Vodka'
AND (s.name ILIKE '%Wine%' OR s.name ILIKE '%Bottle%' OR s.name ILIKE '%Elohim%')
ON CONFLICT DO NOTHING;