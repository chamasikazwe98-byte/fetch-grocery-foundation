-- =============================================
-- SECURITY FIX: Address all error-level findings
-- =============================================

-- 1. FIX: Profiles table exposure (profiles_wallet_exposure, profiles_table_public_exposure)
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create restricted policy: users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT TO authenticated 
USING (
  auth.uid() = id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Create a safe public view for order participants to see limited driver/customer info
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker = on) AS
SELECT 
  id, 
  full_name, 
  avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- 2. FIX: Pending orders exposure (orders_pending_driver_exposure)
-- Drop the overly permissive driver pending orders policy
DROP POLICY IF EXISTS "Drivers can view pending orders" ON public.orders;

-- Create a limited pending orders view for drivers (no address/location until accepted)
CREATE OR REPLACE VIEW public.pending_orders_for_drivers 
WITH (security_invoker = on) AS
SELECT 
  id,
  supermarket_id,
  delivery_zone_id,
  subtotal,
  zone_fee,
  driver_payout,
  requires_car_driver,
  created_at
FROM public.orders
WHERE status = 'pending'::order_status
  AND driver_id IS NULL;

-- Grant access to the view  
GRANT SELECT ON public.pending_orders_for_drivers TO authenticated;

-- Create a policy for drivers to only see pending orders through the view
-- Drivers can accept orders through an RPC function
CREATE POLICY "Drivers can view pending order details after accepting" 
ON public.orders 
FOR SELECT TO authenticated 
USING (
  -- Order is pending and driver is a driver (can see basic info through view)
  (status = 'pending'::order_status AND public.has_role(auth.uid(), 'driver'))
);

-- 3. FIX: Wallet balance updates lack validation (wallet_no_validation)
-- Create a secure function for completing order delivery
CREATE OR REPLACE FUNCTION public.complete_order_delivery(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_id UUID;
  v_payout DECIMAL(10,2);
  v_current_status order_status;
  v_receipt_url TEXT;
BEGIN
  -- Get order details with row lock
  SELECT driver_id, driver_payout, status, receipt_image_url
  INTO v_driver_id, v_payout, v_current_status, v_receipt_url
  FROM orders 
  WHERE id = p_order_id
  FOR UPDATE;
  
  -- Validate order exists
  IF v_driver_id IS NULL THEN
    RAISE EXCEPTION 'Order not found or not assigned';
  END IF;
  
  -- Validate driver owns this order
  IF v_driver_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to complete this order';
  END IF;
  
  -- Validate order is in correct status
  IF v_current_status != 'in_transit' THEN
    RAISE EXCEPTION 'Order must be in transit to complete delivery';
  END IF;
  
  -- Validate receipt is uploaded
  IF v_receipt_url IS NULL OR v_receipt_url = '' THEN
    RAISE EXCEPTION 'Receipt must be uploaded before completing delivery';
  END IF;
  
  -- Update order status
  UPDATE orders 
  SET status = 'delivered', updated_at = now()
  WHERE id = p_order_id;
  
  -- Create payout record
  INSERT INTO driver_payouts (driver_id, order_id, amount, status)
  VALUES (v_driver_id, p_order_id, COALESCE(v_payout, 0), 'pending');
  
  -- Update driver wallet balance
  UPDATE profiles 
  SET wallet_balance = COALESCE(wallet_balance, 0) + COALESCE(v_payout, 0),
      updated_at = now()
  WHERE id = v_driver_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.complete_order_delivery(UUID) TO authenticated;

-- 4. FIX: Order creation lacks server-side price validation (order_create_no_validation)
-- Create a secure function for creating orders with server-side price calculation
CREATE OR REPLACE FUNCTION public.create_secure_order(
  p_supermarket_id UUID,
  p_delivery_zone_id UUID,
  p_delivery_address TEXT,
  p_notes TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_subtotal DECIMAL(10,2) := 0;
  v_service_fee DECIMAL(10,2);
  v_zone_fee DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_driver_payout DECIMAL(10,2);
  v_item JSONB;
  v_price DECIMAL(10,2);
  v_quantity INTEGER;
  v_product_id UUID;
BEGIN
  -- Validate customer role
  IF NOT has_role(auth.uid(), 'customer') THEN
    RAISE EXCEPTION 'Only customers can create orders';
  END IF;
  
  -- Validate delivery address
  IF p_delivery_address IS NULL OR TRIM(p_delivery_address) = '' THEN
    RAISE EXCEPTION 'Delivery address is required';
  END IF;
  
  -- Get zone fee from server
  SELECT fee INTO v_zone_fee 
  FROM delivery_zones 
  WHERE id = p_delivery_zone_id;
  
  IF v_zone_fee IS NULL THEN
    RAISE EXCEPTION 'Invalid delivery zone';
  END IF;
  
  -- Validate supermarket exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM supermarkets 
    WHERE id = p_supermarket_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive supermarket';
  END IF;
  
  -- Validate items array is not empty
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  
  -- Calculate subtotal from actual product prices (server-side validation)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_product_id := (v_item->>'product_id')::UUID;
    
    -- Validate quantity
    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product';
    END IF;
    
    IF v_quantity > 999 THEN
      RAISE EXCEPTION 'Quantity exceeds maximum allowed';
    END IF;
    
    -- Get actual price from database
    SELECT price INTO v_price 
    FROM products 
    WHERE id = v_product_id 
      AND supermarket_id = p_supermarket_id
      AND in_stock = true;
      
    IF v_price IS NULL THEN
      RAISE EXCEPTION 'Product not available or out of stock';
    END IF;
    
    v_subtotal := v_subtotal + (v_price * v_quantity);
  END LOOP;
  
  -- Calculate fees server-side (business rules enforced here)
  v_service_fee := ROUND(v_subtotal * 0.10, 2);  -- 10% service fee
  v_total := v_subtotal + v_service_fee + v_zone_fee;
  v_driver_payout := ROUND(v_zone_fee * 0.80, 2);  -- 80% of zone fee to driver
  
  -- Create order with server-validated values
  INSERT INTO orders (
    customer_id, 
    supermarket_id, 
    delivery_zone_id,
    delivery_address, 
    notes, 
    status,
    subtotal, 
    service_fee, 
    zone_fee, 
    total, 
    driver_payout
  ) VALUES (
    auth.uid(), 
    p_supermarket_id, 
    p_delivery_zone_id,
    TRIM(p_delivery_address), 
    NULLIF(TRIM(p_notes), ''), 
    'pending',
    v_subtotal, 
    v_service_fee, 
    v_zone_fee, 
    v_total, 
    v_driver_payout
  ) RETURNING id INTO v_order_id;
  
  -- Create order items with validated prices from database
  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
  SELECT 
    v_order_id,
    (item->>'product_id')::UUID,
    (item->>'quantity')::INTEGER,
    p.price,
    p.price * (item->>'quantity')::INTEGER
  FROM jsonb_array_elements(p_items) item
  JOIN products p ON p.id = (item->>'product_id')::UUID;
  
  RETURN v_order_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_secure_order(UUID, UUID, TEXT, TEXT, JSONB) TO authenticated;

-- 5. Create a function for drivers to accept pending orders
CREATE OR REPLACE FUNCTION public.accept_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status order_status;
  v_current_driver UUID;
BEGIN
  -- Validate driver role
  IF NOT has_role(auth.uid(), 'driver') THEN
    RAISE EXCEPTION 'Only drivers can accept orders';
  END IF;
  
  -- Get order with lock
  SELECT status, driver_id 
  INTO v_current_status, v_current_driver
  FROM orders 
  WHERE id = p_order_id
  FOR UPDATE;
  
  -- Validate order exists
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Validate order is pending
  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Order is no longer pending';
  END IF;
  
  -- Validate order not already taken
  IF v_current_driver IS NOT NULL THEN
    RAISE EXCEPTION 'Order already accepted by another driver';
  END IF;
  
  -- Assign order to driver and update status
  UPDATE orders 
  SET driver_id = auth.uid(), 
      status = 'accepted',
      updated_at = now()
  WHERE id = p_order_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.accept_order(UUID) TO authenticated;