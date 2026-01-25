-- =============================================
-- SECURITY FIX: Warning-level findings
-- =============================================

-- 1. FIX: Delivery zones lack admin write policies (delivery_zones_write)
-- Add admin policy for managing delivery zones (matches supermarkets/products pattern)
CREATE POLICY "Admins can manage delivery zones" 
ON public.delivery_zones 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX: Receipt images storage (receipt_base64_storage)
-- Create private storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false);

-- Policy: Drivers can upload receipts to their own folder
CREATE POLICY "Drivers can upload receipts" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'receipts' AND
  public.has_role(auth.uid(), 'driver') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Drivers can update their own receipts
CREATE POLICY "Drivers can update own receipts" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'receipts' AND
  public.has_role(auth.uid(), 'driver') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Order participants can view receipts (customer, driver, admin)
CREATE POLICY "Order participants can view receipts" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'receipts' AND
  (
    -- Admins can view all receipts
    public.has_role(auth.uid(), 'admin')
    OR
    -- Check if user is customer or driver for this order
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE receipt_image_url LIKE '%' || storage.filename(name) || '%'
      AND (customer_id = auth.uid() OR driver_id = auth.uid())
    )
  )
);

-- Policy: Admins can delete receipts if needed
CREATE POLICY "Admins can delete receipts" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'receipts' AND
  public.has_role(auth.uid(), 'admin')
);