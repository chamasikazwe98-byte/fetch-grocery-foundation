-- Add expanded supermarket department categories
INSERT INTO categories (id, name, icon) VALUES
  (gen_random_uuid(), 'Pantry & Staples', '🍚'),
  (gen_random_uuid(), 'Breakfast & Cereals', '🥣'),
  (gen_random_uuid(), 'Dairy & Eggs', '🥛'),
  (gen_random_uuid(), 'Bakery & Snacks', '🍞'),
  (gen_random_uuid(), 'Butchery & Frozen', '🥩'),
  (gen_random_uuid(), 'Bathroom & Hygiene', '🧴'),
  (gen_random_uuid(), 'Laundry & Home Care', '🧺'),
  (gen_random_uuid(), 'Baby Care', '👶'),
  (gen_random_uuid(), 'Building Materials', '🧱'),
  (gen_random_uuid(), 'Power Tools', '🔧'),
  (gen_random_uuid(), 'Plumbing', '🚿'),
  (gen_random_uuid(), 'Electrical', '💡'),
  (gen_random_uuid(), 'Paint & Decor', '🎨')
ON CONFLICT DO NOTHING;