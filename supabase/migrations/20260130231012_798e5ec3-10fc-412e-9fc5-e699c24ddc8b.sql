-- Add new categories for store types
INSERT INTO categories (name, icon) VALUES
  ('Wine & Liquor', '🍷'),
  ('Hardware', '🔧'),
  ('Pizza', '🍕')
ON CONFLICT DO NOTHING;

-- Add KFC branches
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
  ('KFC', 'Levy Mall', 'Levy Junction Mall, Lusaka', -15.4050, 28.3225, 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400', true),
  ('KFC', 'East Park Mall', 'East Park Mall, Lusaka', -15.3894, 28.3450, 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400', true),
  ('KFC', 'Manda Hill', 'Manda Hill Shopping Centre, Lusaka', -15.3986, 28.3167, 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400', true),
  ('KFC', 'Cairo Road', 'Cairo Road, Lusaka', -15.4167, 28.2833, 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=400', true);

-- Add Nandos branches
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
  ('Nandos', 'Levy Mall', 'Levy Junction Mall, Lusaka', -15.4055, 28.3230, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', true),
  ('Nandos', 'East Park Mall', 'East Park Mall, Lusaka', -15.3892, 28.3455, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', true),
  ('Nandos', 'Arcades', 'Arcades Shopping Centre, Lusaka', -15.4012, 28.3089, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', true);

-- Add Pedro's branches
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
  ('Pedros', 'Kabulonga', 'Kabulonga Shopping Area, Lusaka', -15.4167, 28.3333, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', true),
  ('Pedros', 'Woodlands', 'Woodlands, Lusaka', -15.4100, 28.3100, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', true),
  ('Pedros', 'PHI', 'PHI, Lusaka', -15.3900, 28.3200, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', true);

-- Add Wine & Liquor stores
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
  ('The Wine Shop', 'East Park', 'East Park Mall, Lusaka', -15.3894, 28.3450, 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400', true),
  ('The Wine Shop', 'Garden City', 'Garden City Mall, Lusaka', -15.4020, 28.3100, 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400', true),
  ('The Wine Shop', 'Waterfalls', 'Waterfalls Mall, Lusaka', -15.4200, 28.3000, 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400', true),
  ('The Bottle Shop', 'East Park', 'East Park Mall, Lusaka', -15.3892, 28.3453, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
  ('The Bottle Shop', 'Kabulonga', 'Kabulonga, Lusaka', -15.4167, 28.3333, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
  ('The Bottle Shop', 'Woodlands', 'Woodlands, Lusaka', -15.4100, 28.3100, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
  ('The Bottle Shop', 'Chilenje', 'Chilenje, Lusaka', -15.4400, 28.2900, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
  ('The Bakery', 'Central Street', 'Central Street, Lusaka', -15.4167, 28.2833, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true),
  ('Elohim Liquor Store', 'Main', 'Lusaka Central', -15.4150, 28.2850, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400', true);

-- Add Hardware stores
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
  ('MicMar Hardware', 'Town', 'Town Centre, Lusaka', -15.4167, 28.2833, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true),
  ('MicMar Hardware', 'East Park', 'East Park Mall, Lusaka', -15.3894, 28.3450, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true),
  ('MicMar Hardware', 'Freedom Way', 'Freedom Way, Lusaka', -15.4100, 28.2900, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', true),
  ('Builders Warehouse', 'East Park', 'East Park Mall, Lusaka', -15.3894, 28.3450, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400', true),
  ('Builders Warehouse', 'Cosmopolitan Mall', 'Cosmopolitan Mall, Lusaka', -15.4000, 28.3200, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400', true);