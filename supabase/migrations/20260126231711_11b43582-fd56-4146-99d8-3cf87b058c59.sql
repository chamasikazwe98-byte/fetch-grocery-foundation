-- Update create_secure_order function to accept delivery coordinates
CREATE OR REPLACE FUNCTION public.create_secure_order(
  p_supermarket_id uuid,
  p_delivery_zone_id uuid,
  p_delivery_address text,
  p_notes text,
  p_items jsonb,
  p_delivery_latitude numeric DEFAULT NULL,
  p_delivery_longitude numeric DEFAULT NULL
)
RETURNS uuid
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
  
  -- Create order with server-validated values (now including coordinates)
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