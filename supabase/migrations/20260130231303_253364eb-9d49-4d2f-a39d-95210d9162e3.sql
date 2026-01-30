-- Insert KFC products
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'a8e1acd2-083a-4482-a62e-0ca3c38cf6ab'::uuid, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (VALUES
  ('2pc Dunked Meal', 'Two pieces of crispy fried chicken with chips and drink', 89.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
  ('3pc Dunked Meal', 'Three pieces of crispy fried chicken with chips and drink', 109.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
  ('Streetwise Two', 'Two pieces of chicken with small chips', 65.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
  ('Zinger Burger', 'Spicy chicken fillet burger', 75.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('Zinger Box', 'Zinger burger, wings, chips and drink', 115.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('10pc Bucket', 'Ten pieces of original recipe chicken', 195.00, 'https://images.unsplash.com/photo-1585325701165-351af916e946?w=400'),
  ('21pc Bucket', 'Twenty-one pieces for sharing', 350.00, 'https://images.unsplash.com/photo-1585325701165-351af916e946?w=400'),
  ('Hot Wings (6pc)', 'Six spicy hot wings', 55.00, 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=400'),
  ('Large Fries', 'Golden crispy fries', 28.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
  ('Coleslaw', 'Creamy coleslaw', 18.00, 'https://images.unsplash.com/photo-1625938145744-e380515399bf?w=400')
) AS p(name, description, price, image_url)
WHERE s.name = 'KFC' AND s.is_active = true;

-- Insert Nandos products
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'a8e1acd2-083a-4482-a62e-0ca3c38cf6ab'::uuid, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (VALUES
  ('Quarter Chicken', 'Flame-grilled PERi-PERi chicken quarter', 79.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Half Chicken', 'Flame-grilled PERi-PERi chicken half', 115.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Full Chicken', 'Whole flame-grilled PERi-PERi chicken', 195.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Chicken Breast Burger', 'Grilled chicken breast fillet in a bun', 85.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('Chicken Thigh Burger', 'Grilled chicken thigh fillet in a bun', 75.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('Chicken Wrap', 'Grilled chicken in a soft tortilla', 70.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'),
  ('Espetada', 'Three chicken thighs on a skewer', 95.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Chicken Wings (10pc)', 'Ten flame-grilled wings', 89.00, 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=400'),
  ('PERi-PERi Chips', 'Chips with PERi-PERi salt', 35.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
  ('Spicy Rice', 'PERi-PERi spiced rice', 30.00, 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400')
) AS p(name, description, price, image_url)
WHERE s.name = 'Nandos' AND s.is_active = true;

-- Insert Pedros products
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, 'a8e1acd2-083a-4482-a62e-0ca3c38cf6ab'::uuid, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (VALUES
  ('2pc Flame-Grilled', 'Two pieces flame-grilled chicken with chips', 69.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('3pc Flame-Grilled', 'Three pieces flame-grilled chicken with chips', 89.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Quarter Chicken', 'Quarter flame-grilled chicken', 55.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Half Chicken', 'Half flame-grilled chicken with two sides', 95.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Full Chicken', 'Full flame-grilled chicken with sides', 175.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'),
  ('Chicken Burger', 'Grilled chicken fillet burger', 55.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('Chicken Wrap', 'Chicken wrap with fresh salad', 50.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'),
  ('Wings (6pc)', 'Six flame-grilled wings', 45.00, 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=400'),
  ('Family Meal', '8pc chicken with 4 sides', 250.00, 'https://images.unsplash.com/photo-1585325701165-351af916e946?w=400'),
  ('Large Chips', 'Crispy golden chips', 25.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400')
) AS p(name, description, price, image_url)
WHERE s.name = 'Pedros' AND s.is_active = true;

-- Insert Wine & Liquor products (Wine Shop, Bottle Shop, Elohim)
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '74308369-d59a-4bdc-868b-64bd8808eec3'::uuid, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (VALUES
  ('Mosi Lager 500ml', 'Zambian premium lager beer', 18.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
  ('Castle Lager 500ml', 'Classic lager beer', 20.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
  ('Heineken 330ml', 'Premium imported lager', 28.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
  ('Jameson Irish Whiskey 750ml', 'Smooth Irish whiskey', 450.00, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400'),
  ('Johnnie Walker Red 750ml', 'Blended Scotch whisky', 380.00, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400'),
  ('Johnnie Walker Black 750ml', 'Premium blended whisky', 650.00, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400'),
  ('Smirnoff Vodka 750ml', 'Premium vodka', 220.00, 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400'),
  ('Gordons Gin 750ml', 'London dry gin', 280.00, 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400'),
  ('Bacardi White Rum 750ml', 'White rum for cocktails', 250.00, 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400'),
  ('KWV Cabernet Sauvignon 750ml', 'South African red wine', 165.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
  ('Robertson Chardonnay 750ml', 'Crisp white wine', 145.00, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
  ('Four Cousins Sweet Rose 750ml', 'Sweet rose wine', 95.00, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'),
  ('Moet Chandon 750ml', 'Premium champagne', 1200.00, 'https://images.unsplash.com/photo-1592483648228-b35146a4330c?w=400')
) AS p(name, description, price, image_url)
WHERE s.name IN ('The Wine Shop', 'The Bottle Shop', 'Elohim Liquor Store') AND s.is_active = true;

-- Insert Hardware products (MicMar, Builders Warehouse)
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, '99e24163-48ca-4fdb-a88e-6ee0db4a5d2d'::uuid, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN (VALUES
  ('Hammer 500g', 'Steel claw hammer with rubber grip - Light', 85.00, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400'),
  ('Screwdriver Set (6pc)', 'Phillips and flathead set - Fits in bag', 120.00, 'https://images.unsplash.com/photo-1590282581203-a168ee7b1b6f?w=400'),
  ('Power Drill 18V', 'Cordless power drill with battery - MEDIUM SIZE', 650.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
  ('Angle Grinder 115mm', 'Electric angle grinder - REQUIRES CAR', 450.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
  ('Measuring Tape 5m', 'Retractable steel tape - Pocket size', 45.00, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'),
  ('Spirit Level 60cm', 'Aluminum spirit level - Long item', 95.00, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'),
  ('Paint Bucket 20L', 'White emulsion paint - HEAVY, CAR ONLY', 380.00, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'),
  ('Paint Brush Set', 'Various sizes for painting - Light', 65.00, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'),
  ('Cement 50kg', 'Portland cement bag - VERY HEAVY, CAR ONLY', 125.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
  ('PVC Pipe 3m', 'Drainage pipe - LONG ITEM, CAR ONLY', 85.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
  ('Electrical Cable 50m', 'Twin and earth cable - Coiled, medium', 220.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
  ('Light Bulb LED 9W', 'Energy saving bulb - Small box', 35.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
  ('Door Lock Set', 'Complete lock with keys - Small box', 185.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
  ('Wheelbarrow', 'Galvanized steel wheelbarrow - LARGE, CAR ONLY', 450.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400'),
  ('Garden Hose 30m', 'Flexible garden hose with fittings', 175.00, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400')
) AS p(name, description, price, image_url)
WHERE s.name IN ('MicMar Hardware', 'Builders Warehouse') AND s.is_active = true;

-- Add groceries to Shoprite branches
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, c.id, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN categories c
CROSS JOIN (VALUES
  ('Dairy', 'Fresh Milk 2L', 'Full cream fresh milk', 42.00, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
  ('Dairy', 'Eggs (30 pack)', 'Farm fresh eggs', 95.00, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
  ('Dairy', 'Butter 500g', 'Salted butter', 65.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'),
  ('Bakery', 'White Bread Loaf', 'Fresh baked white bread', 22.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
  ('Bakery', 'Brown Bread Loaf', 'Whole wheat bread', 25.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
  ('Meat & Poultry', 'Chicken Whole 1.5kg', 'Fresh whole chicken', 89.00, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'),
  ('Meat & Poultry', 'Beef Mince 500g', 'Fresh beef mince', 75.00, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400'),
  ('Fruits & Vegetables', 'Tomatoes 1kg', 'Fresh red tomatoes', 28.00, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'),
  ('Fruits & Vegetables', 'Onions 1kg', 'Fresh onions', 22.00, 'https://images.unsplash.com/photo-1618512496248-a07b73d7d048?w=400'),
  ('Beverages', 'Coca-Cola 2L', 'Coca-Cola soft drink', 28.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400')
) AS p(cat_name, name, description, price, image_url)
WHERE s.name = 'Shoprite' AND s.is_active = true AND c.name = p.cat_name;

-- Add groceries to Pick n Pay branches
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT s.id, c.id, p.name, p.description, p.price, p.image_url, true
FROM supermarkets s
CROSS JOIN categories c
CROSS JOIN (VALUES
  ('Dairy', 'Fresh Milk 2L', 'Full cream fresh milk', 44.00, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
  ('Dairy', 'Eggs (30 pack)', 'Farm fresh eggs', 98.00, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
  ('Dairy', 'Cheese 400g', 'Cheddar cheese block', 78.00, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400'),
  ('Bakery', 'White Bread Loaf', 'Fresh baked bread', 24.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
  ('Meat & Poultry', 'Chicken Breast 1kg', 'Fresh chicken breast', 115.00, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'),
  ('Meat & Poultry', 'Stewing Beef 500g', 'Beef chunks for stew', 95.00, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400'),
  ('Fruits & Vegetables', 'Bananas 1kg', 'Fresh bananas', 32.00, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'),
  ('Fruits & Vegetables', 'Apples 1kg', 'Fresh red apples', 45.00, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400'),
  ('Beverages', 'Orange Juice 1L', 'Fresh orange juice', 38.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400')
) AS p(cat_name, name, description, price, image_url)
WHERE s.name = 'Pick n Pay' AND s.is_active = true AND c.name = p.cat_name;