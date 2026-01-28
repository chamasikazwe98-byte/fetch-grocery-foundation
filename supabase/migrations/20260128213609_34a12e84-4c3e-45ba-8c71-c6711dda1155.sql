-- Add 'awaiting_payment' to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_payment' BEFORE 'pending';

-- Create RPC to confirm payment and transition to pending
CREATE OR REPLACE FUNCTION public.confirm_order_payment(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_status order_status;
  v_customer_id uuid;
BEGIN
  -- Get order with lock
  SELECT status, customer_id 
  INTO v_current_status, v_customer_id
  FROM orders 
  WHERE id = p_order_id
  FOR UPDATE;
  
  -- Validate order exists
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Validate order belongs to current user
  IF v_customer_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to confirm this order';
  END IF;
  
  -- Validate order is awaiting payment
  IF v_current_status != 'awaiting_payment' THEN
    RAISE EXCEPTION 'Order is not awaiting payment';
  END IF;
  
  -- Update to pending status (makes it visible to drivers)
  UPDATE orders 
  SET status = 'pending',
      updated_at = now()
  WHERE id = p_order_id;
  
  RETURN true;
END;
$$;

-- Update create_secure_order to set initial status to 'awaiting_payment'
CREATE OR REPLACE FUNCTION public.create_secure_order(p_supermarket_id uuid, p_delivery_zone_id uuid, p_delivery_address text, p_notes text, p_items jsonb, p_delivery_latitude numeric DEFAULT NULL::numeric, p_delivery_longitude numeric DEFAULT NULL::numeric, p_delivery_distance_km numeric DEFAULT NULL::numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id UUID;
  v_subtotal DECIMAL(10,2) := 0;
  v_service_fee DECIMAL(10,2);
  v_delivery_fee DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_driver_payout DECIMAL(10,2);
  v_item JSONB;
  v_price DECIMAL(10,2);
  v_quantity INTEGER;
  v_product_id UUID;
  v_zone_fee DECIMAL(10,2) := 0;
BEGIN
  -- Validate customer role
  IF NOT has_role(auth.uid(), 'customer') THEN
    RAISE EXCEPTION 'Only customers can create orders';
  END IF;
  
  -- Validate delivery address
  IF p_delivery_address IS NULL OR TRIM(p_delivery_address) = '' THEN
    RAISE EXCEPTION 'Delivery address is required';
  END IF;
  
  -- Calculate delivery fee based on distance (K10 per km, minimum K30)
  IF p_delivery_distance_km IS NOT NULL AND p_delivery_distance_km > 0 THEN
    v_delivery_fee := GREATEST(ROUND(p_delivery_distance_km * 10, 2), 30);
  ELSE
    -- Fallback to zone-based fee if distance not provided
    SELECT fee INTO v_zone_fee 
    FROM delivery_zones 
    WHERE id = p_delivery_zone_id;
    
    v_delivery_fee := COALESCE(v_zone_fee, 30);
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
  v_total := v_subtotal + v_service_fee + v_delivery_fee;
  v_driver_payout := ROUND(v_delivery_fee * 0.80, 2);  -- 80% of delivery fee to driver
  
  -- Create order with initial status 'awaiting_payment' (not visible to drivers yet)
  INSERT INTO orders (
    customer_id, 
    supermarket_id, 
    delivery_zone_id,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
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
    p_delivery_latitude,
    p_delivery_longitude,
    NULLIF(TRIM(p_notes), ''), 
    'awaiting_payment',  -- Changed from 'pending' to 'awaiting_payment'
    v_subtotal, 
    v_service_fee, 
    v_delivery_fee,
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
$function$;