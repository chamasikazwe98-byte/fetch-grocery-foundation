-- Add new ShopRite branches (without deleting existing ones)
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
('Shoprite', 'Bauleni Mall', 'Bauleni Mall, Lusaka', -15.4250, 28.3100, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true),
('Shoprite', 'Chalala', 'Chalala, Lusaka', -15.4400, 28.2950, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true),
('Shoprite', 'Makeni Mall', 'Makeni Mall, Lusaka', -15.4600, 28.3200, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true),
('Shoprite', 'Munali Mall', 'Munali Mall, Lusaka', -15.4100, 28.2800, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true),
('Shoprite', 'East Park Mall', 'East Park Mall, Lusaka', -15.3900, 28.3500, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true),
('Shoprite', 'East Park Mall Select', 'East Park Mall, Lusaka', -15.3901, 28.3501, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', true),
('Shoprite', 'Lewanika Mall', 'Lewanika Mall, Lusaka', -15.4050, 28.2600, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', true);

-- Update existing Pick n Pay name and add new branches
UPDATE supermarkets SET name = 'Pick n Pay', branch = 'Cairo Road' WHERE name = 'Pick n Pay' AND branch = 'Main';

INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
('Pick n Pay', 'PHI Mall', 'PHI Mall, Great East Road, Lusaka', -15.4000, 28.3300, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800', true),
('Pick n Pay', 'Leopards Hill', 'Leopards Hill Road, Lusaka', -15.4500, 28.3400, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800', true);

-- Add Hungry Lion as a new store chain
INSERT INTO supermarkets (name, branch, address, latitude, longitude, image_url, is_active) VALUES
('Hungry Lion', 'PHI', 'PHI Mall, Great East Road, Lusaka', -15.4000, 28.3300, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true),
('Hungry Lion', 'NRDC', 'NRDC Building, Cairo Road, Lusaka', -15.4150, 28.2850, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true),
('Hungry Lion', 'Kabulonga', 'Kabulonga Shopping Centre, Lusaka', -15.4200, 28.3100, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true),
('Hungry Lion', 'Pinnacle Mall', 'Pinnacle Mall, Great East Road, Lusaka', -15.4167, 28.3200, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true),
('Hungry Lion', 'Lewanika Mall', 'Lewanika Mall, Lusaka', -15.4050, 28.2600, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true),
('Hungry Lion', 'Chilenje', 'Chilenje Shopping Centre, Lusaka', -15.4450, 28.2850, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', true);

-- Add Fast Food category
INSERT INTO categories (name, icon) VALUES ('Fast Food', '🍗');

-- Add estimated_package_size column to orders for driver vehicle compatibility
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_package_size TEXT DEFAULT 'Small';

-- Mark old/duplicate stores as inactive to clean up
UPDATE supermarkets SET is_active = false WHERE name = 'Choppies';
UPDATE supermarkets SET is_active = false WHERE name = 'Game';