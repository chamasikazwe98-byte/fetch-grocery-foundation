-- Allow drivers to view customer phone for their accepted orders
CREATE POLICY "Drivers can view customer phone for assigned orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.customer_id = profiles.id
    AND orders.driver_id = auth.uid()
    AND orders.status NOT IN ('pending', 'awaiting_payment', 'delivered', 'cancelled')
  )
);