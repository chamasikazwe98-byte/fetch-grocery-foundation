-- Add Hungry Lion menu products with dummy items
WITH hungry_lion_stores AS (
  SELECT id FROM supermarkets WHERE name = 'Hungry Lion' AND is_active = true
),
fast_food_category AS (
  SELECT id FROM categories WHERE name = 'Fast Food' LIMIT 1
)
INSERT INTO products (supermarket_id, category_id, name, description, price, image_url, in_stock)
SELECT 
  hl.id,
  fc.id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  true
FROM hungry_lion_stores hl
CROSS JOIN fast_food_category fc
CROSS JOIN (VALUES
  ('2pc Chicken Meal', 'Crispy fried chicken with chips and coleslaw', 75.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
  ('3pc Chicken Meal', 'Three pieces of crispy fried chicken with chips', 95.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'),
  ('Streetwise Bucket', '6 pieces of crispy chicken for sharing', 145.00, 'https://images.unsplash.com/photo-1585325701165-351af916e946?w=400'),
  ('Family Feast', '10 pieces of chicken with 4 portions of chips', 220.00, 'https://images.unsplash.com/photo-1585325701165-351af916e946?w=400'),
  ('Chicken Wings (6pc)', 'Spicy or BBQ chicken wings', 55.00, 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=400'),
  ('Chicken Burger', 'Crispy chicken fillet in a soft bun with lettuce', 45.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400'),
  ('Spicy Chicken Wrap', 'Wrapped in tortilla with spicy sauce and veggies', 42.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'),
  ('Large Chips', 'Golden crispy french fries', 25.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
  ('Coleslaw', 'Fresh creamy coleslaw', 15.00, 'https://images.unsplash.com/photo-1625938145744-e380515399bf?w=400'),
  ('Soft Drink (500ml)', 'Choose from Coke, Fanta, or Sprite', 12.00, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400')
) AS p(name, description, price, image_url);