-- Add new order status values for granular tracking
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'arrived_at_store' AFTER 'accepted';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shopping_completed' AFTER 'shopping';

-- Update the complete_order_delivery function to handle new statuses
CREATE OR REPLACE FUNCTION complete_order_delivery(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_driver_id uuid;
BEGIN
  -- Get and lock the order
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Verify the caller is the assigned driver
  v_driver_id := auth.uid();
  IF v_order.driver_id != v_driver_id THEN
    RAISE EXCEPTION 'Only assigned driver can complete delivery';
  END IF;

  -- Verify order is in transit
  IF v_order.status != 'in_transit' THEN
    RAISE EXCEPTION 'Order must be in transit to complete delivery';
  END IF;

  -- Verify receipt was uploaded
  IF v_order.receipt_image_url IS NULL THEN
    RAISE EXCEPTION 'Receipt must be uploaded before completing delivery';
  END IF;

  -- Update order status to delivered
  UPDATE orders
  SET status = 'delivered', updated_at = now()
  WHERE id = p_order_id;

  -- Create payout record
  INSERT INTO driver_payouts (driver_id, order_id, amount, status)
  VALUES (v_driver_id, p_order_id, v_order.driver_payout, 'completed');

  -- Update driver wallet balance
  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + v_order.driver_payout,
      updated_at = now()
  WHERE id = v_driver_id;

  RETURN true;
END;
$$;