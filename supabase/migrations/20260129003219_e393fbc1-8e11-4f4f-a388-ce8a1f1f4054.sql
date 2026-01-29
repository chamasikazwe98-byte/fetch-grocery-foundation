-- Add carrier bags fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS carrier_bags_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS carrier_bags_total numeric DEFAULT 0;

-- Add till_amount for driver to input actual till amount
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS till_amount numeric DEFAULT NULL;

-- Add funds_confirmed to track when driver has received funds (for Shoprite flow)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS funds_confirmed boolean DEFAULT false;

-- Update create_secure_order function to accept carrier bags
CREATE OR REPLACE FUNCTION public.create_secure_order(
  p_supermarket_id uuid,
  p_delivery_zone_id uuid,
  p_delivery_address text,
  p_notes text,
  p_items jsonb,
  p_delivery_latitude double precision DEFAULT NULL,
  p_delivery_longitude double precision DEFAULT NULL,
  p_delivery_distance_km double precision DEFAULT NULL,
  p_carrier_bags_count integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_service_fee numeric;
  v_zone_fee numeric;
  v_total numeric;
  v_driver_payout numeric;
  v_item record;
  v_product record;
  v_rate_per_km numeric := 10;
  v_min_delivery_fee numeric := 30;
  v_carrier_bag_price numeric := 3.50;
  v_carrier_bags_total numeric;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate subtotal from actual product prices (prevents client-side tampering)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    SELECT price INTO v_product FROM products WHERE id = v_item.product_id;
    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item.product_id;
    END IF;
    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
  END LOOP;

  -- Calculate service fee (10%)
  v_service_fee := v_subtotal * 0.10;

  -- Calculate zone fee based on distance (K10/km, min K30)
  IF p_delivery_distance_km IS NOT NULL THEN
    v_zone_fee := GREATEST(p_delivery_distance_km * v_rate_per_km, v_min_delivery_fee);
  ELSE
    v_zone_fee := v_min_delivery_fee;
  END IF;

  -- Round zone fee to 2 decimal places
  v_zone_fee := ROUND(v_zone_fee::numeric, 2);

  -- Calculate carrier bags total
  v_carrier_bags_total := p_carrier_bags_count * v_carrier_bag_price;

  -- Calculate total (subtotal + service fee + zone fee + carrier bags)
  v_total := v_subtotal + v_service_fee + v_zone_fee + v_carrier_bags_total;

  -- Calculate driver payout (80% of zone fee)
  v_driver_payout := v_zone_fee * 0.80;

  -- Create order with awaiting_payment status
  INSERT INTO orders (
    customer_id,
    supermarket_id,
    delivery_zone_id,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    notes,
    subtotal,
    service_fee,
    zone_fee,
    total,
    driver_payout,
    carrier_bags_count,
    carrier_bags_total,
    status
  ) VALUES (
    auth.uid(),
    p_supermarket_id,
    p_delivery_zone_id,
    p_delivery_address,
    p_delivery_latitude,
    p_delivery_longitude,
    p_notes,
    v_subtotal,
    v_service_fee,
    v_zone_fee,
    v_total,
    v_driver_payout,
    p_carrier_bags_count,
    v_carrier_bags_total,
    'awaiting_payment'
  )
  RETURNING id INTO v_order_id;

  -- Create order items with server-side prices
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
  LOOP
    SELECT price INTO v_product FROM products WHERE id = v_item.product_id;
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
    VALUES (v_order_id, v_item.product_id, v_item.quantity, v_product.price, v_product.price * v_item.quantity);
  END LOOP;

  RETURN v_order_id;
END;
$$;