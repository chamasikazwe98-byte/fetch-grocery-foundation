-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'driver', 'admin');

-- Create vehicle types enum
CREATE TYPE public.vehicle_type AS ENUM ('bicycle', 'motorcycle', 'car');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'shopping', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    vehicle_type public.vehicle_type,
    is_available BOOLEAN DEFAULT false,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (security best practice - roles in separate table)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Create supermarkets table
CREATE TABLE public.supermarkets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    branch TEXT,
    address TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create product categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id UUID REFERENCES public.supermarkets(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create delivery zones
CREATE TABLE public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) NOT NULL,
    driver_id UUID REFERENCES auth.users(id),
    supermarket_id UUID REFERENCES public.supermarkets(id) NOT NULL,
    status public.order_status DEFAULT 'pending' NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    delivery_zone_id UUID REFERENCES public.delivery_zones(id),
    subtotal DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    zone_fee DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    driver_payout DECIMAL(10,2),
    receipt_image_url TEXT,
    requires_car_driver BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create driver payouts table
CREATE TABLE public.driver_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create app settings table for debug mode
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    debug_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  -- Get role from metadata, default to 'customer'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role,
    'customer'::public.app_role
  );
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Create app settings
  INSERT INTO public.app_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: Users can read all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: Only admins can manage, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Supermarkets: Public read
CREATE POLICY "Supermarkets are viewable by everyone" ON public.supermarkets FOR SELECT USING (true);
CREATE POLICY "Admins can manage supermarkets" ON public.supermarkets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Products: Public read
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Delivery zones: Public read
CREATE POLICY "Delivery zones are viewable by everyone" ON public.delivery_zones FOR SELECT USING (true);

-- Orders: Customers see own, drivers see available/assigned, admins see all
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT TO authenticated 
  USING (customer_id = auth.uid() OR driver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT TO authenticated 
  WITH CHECK (customer_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));
CREATE POLICY "Drivers can update assigned orders" ON public.orders FOR UPDATE TO authenticated 
  USING (driver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Drivers can view pending orders" ON public.orders FOR SELECT TO authenticated 
  USING (status = 'pending' AND public.has_role(auth.uid(), 'driver'));

-- Order items: Same as orders
CREATE POLICY "Order items viewable with order access" ON public.order_items FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.customer_id = auth.uid() OR orders.driver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Customers can add order items" ON public.order_items FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- Driver payouts: Drivers see own, admins see all
CREATE POLICY "Drivers can view own payouts" ON public.driver_payouts FOR SELECT TO authenticated USING (driver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage payouts" ON public.driver_payouts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- App settings: Users manage own
CREATE POLICY "Users can view own settings" ON public.app_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON public.app_settings FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- SEED DATA

-- Insert delivery zones
INSERT INTO public.delivery_zones (name, fee, description) VALUES
  ('Zone A - Central', 30.00, 'Central Lusaka - 0-5km'),
  ('Zone B - Suburban', 50.00, 'Suburban Areas - 5-15km'),
  ('Zone C - Outer', 80.00, 'Outer Areas - 15km+');

-- Insert categories
INSERT INTO public.categories (name, icon) VALUES
  ('Dairy', '🥛'),
  ('Bakery', '🍞'),
  ('Meat & Poultry', '🥩'),
  ('Fruits & Vegetables', '🥬'),
  ('Beverages', '🥤'),
  ('Snacks', '🍪'),
  ('Household', '🧹'),
  ('Personal Care', '🧴');

-- Insert supermarkets
INSERT INTO public.supermarkets (name, branch, address, latitude, longitude, image_url) VALUES
  ('Shoprite', 'Pinnacle Select', 'Pinnacle Mall, Great East Road, Lusaka', -15.4167, 28.3200, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'),
  ('Shoprite', 'Chilenje', 'Chilenje Shopping Centre, Lusaka', -15.4450, 28.2850, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'),
  ('Shoprite', 'Waterfalls', 'Waterfalls Mall, Lusaka', -15.4100, 28.3100, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'),
  ('Pick n Pay', 'Main', 'Cairo Road, Lusaka', -15.4050, 28.2870, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'),
  ('Choppies', 'Main', 'Manda Hill, Lusaka', -15.3900, 28.3200, 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800'),
  ('Game', 'Main', 'Manda Hill Mall, Lusaka', -15.3905, 28.3210, 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800');

-- Insert products for each supermarket
DO $$
DECLARE
  supermarket_rec RECORD;
  dairy_id UUID;
  bakery_id UUID;
  meat_id UUID;
  fruits_id UUID;
  beverages_id UUID;
  snacks_id UUID;
BEGIN
  SELECT id INTO dairy_id FROM public.categories WHERE name = 'Dairy';
  SELECT id INTO bakery_id FROM public.categories WHERE name = 'Bakery';
  SELECT id INTO meat_id FROM public.categories WHERE name = 'Meat & Poultry';
  SELECT id INTO fruits_id FROM public.categories WHERE name = 'Fruits & Vegetables';
  SELECT id INTO beverages_id FROM public.categories WHERE name = 'Beverages';
  SELECT id INTO snacks_id FROM public.categories WHERE name = 'Snacks';
  
  FOR supermarket_rec IN SELECT id, name FROM public.supermarkets LOOP
    -- Dairy products
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, dairy_id, 'Fresh Milk 1L', 'Full cream fresh milk', 28.50 + random()*5, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
      (supermarket_rec.id, dairy_id, 'Eggs (6 pack)', 'Farm fresh eggs', 32.00 + random()*5, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
      (supermarket_rec.id, dairy_id, 'Butter 500g', 'Salted butter', 85.00 + random()*10, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'),
      (supermarket_rec.id, dairy_id, 'Cheese Block 400g', 'Cheddar cheese', 95.00 + random()*15, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400');
    
    -- Bakery products
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, bakery_id, 'White Bread', 'Fresh sliced bread', 22.00 + random()*3, 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400'),
      (supermarket_rec.id, bakery_id, 'Brown Bread', 'Whole wheat bread', 25.00 + random()*3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400');
    
    -- Meat products
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, meat_id, 'Chicken Breast 1kg', 'Fresh chicken breast', 89.00 + random()*20, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'),
      (supermarket_rec.id, meat_id, 'Beef Mince 500g', 'Lean beef mince', 75.00 + random()*15, 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400'),
      (supermarket_rec.id, meat_id, 'Pork Chops 500g', 'Fresh pork chops', 68.00 + random()*12, 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400');
    
    -- Fruits & Vegetables
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, fruits_id, 'Tomatoes 1kg', 'Fresh red tomatoes', 18.00 + random()*5, 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400'),
      (supermarket_rec.id, fruits_id, 'Onions 1kg', 'Fresh onions', 15.00 + random()*3, 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400'),
      (supermarket_rec.id, fruits_id, 'Bananas (bunch)', 'Fresh bananas', 25.00 + random()*5, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400');
    
    -- Beverages
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, beverages_id, 'Coca-Cola 2L', 'Carbonated soft drink', 35.00 + random()*5, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'),
      (supermarket_rec.id, beverages_id, 'Orange Juice 1L', '100% pure orange juice', 45.00 + random()*8, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400');
    
    -- Snacks
    INSERT INTO public.products (supermarket_id, category_id, name, description, price, image_url) VALUES
      (supermarket_rec.id, snacks_id, 'Potato Chips 150g', 'Salted potato chips', 28.00 + random()*5, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400');
  END LOOP;
END $$;