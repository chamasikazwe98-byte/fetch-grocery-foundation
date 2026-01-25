-- Fix 1: Remove the permissive policy that exposes customer addresses to ALL drivers
-- This policy allowed any driver to see ALL pending orders including sensitive delivery addresses
DROP POLICY IF EXISTS "Drivers can view pending order details after accepting" ON public.orders;

-- Fix 2: Create a secure function for drivers to view the order pool
-- This returns only non-sensitive columns and enforces driver role check
CREATE OR REPLACE FUNCTION public.get_pending_orders_for_drivers()
RETURNS TABLE (
  id uuid,
  supermarket_id uuid,
  supermarket_name text,
  supermarket_branch text,
  supermarket_address text,
  delivery_zone_id uuid,
  zone_name text,
  subtotal numeric,
  zone_fee numeric,
  driver_payout numeric,
  requires_car_driver boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.supermarket_id,
    s.name as supermarket_name,
    s.branch as supermarket_branch,
    s.address as supermarket_address,
    o.delivery_zone_id,
    dz.name as zone_name,
    o.subtotal,
    o.zone_fee,
    o.driver_payout,
    o.requires_car_driver,
    o.created_at
  FROM orders o
  JOIN supermarkets s ON s.id = o.supermarket_id
  LEFT JOIN delivery_zones dz ON dz.id = o.delivery_zone_id
  WHERE o.status = 'pending'
    AND o.driver_id IS NULL
    AND has_role(auth.uid(), 'driver')
  ORDER BY o.created_at DESC
$$;

-- Fix 3: Recreate public_profiles view without security_invoker
-- This allows order participants to see limited profile info (name, avatar only)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT id, full_name, avatar_url
  FROM public.profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Note: The pending_orders_for_drivers view is now obsolete since we use the function
-- We keep it for backwards compatibility but access is now restricted via the orders table RLS