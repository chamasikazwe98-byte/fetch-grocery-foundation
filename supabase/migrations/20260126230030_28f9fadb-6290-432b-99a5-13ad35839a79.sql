-- Create driver_locations table for real-time tracking
CREATE TABLE public.driver_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  heading NUMERIC,
  speed NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Drivers can insert/update their own location
CREATE POLICY "Drivers can manage their own location"
ON public.driver_locations
FOR ALL
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Customers can view driver location for their orders
CREATE POLICY "Customers can view driver location for their orders"
ON public.driver_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.driver_id = driver_locations.driver_id
    AND orders.customer_id = auth.uid()
    AND orders.status IN ('accepted', 'shopping', 'ready_for_pickup', 'in_transit')
  )
);

-- Admins can view all locations
CREATE POLICY "Admins can view all driver locations"
ON public.driver_locations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX idx_driver_locations_order_id ON public.driver_locations(order_id);
CREATE INDEX idx_driver_locations_updated_at ON public.driver_locations(updated_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_driver_locations_updated_at
BEFORE UPDATE ON public.driver_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create or replace function to upsert driver location
CREATE OR REPLACE FUNCTION public.upsert_driver_location(
  p_order_id UUID,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_accuracy NUMERIC DEFAULT NULL,
  p_heading NUMERIC DEFAULT NULL,
  p_speed NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_location_id UUID;
BEGIN
  -- Validate driver role
  IF NOT has_role(auth.uid(), 'driver') THEN
    RAISE EXCEPTION 'Only drivers can update location';
  END IF;

  -- Upsert location (update if exists for this driver, otherwise insert)
  INSERT INTO driver_locations (driver_id, order_id, latitude, longitude, accuracy, heading, speed)
  VALUES (auth.uid(), p_order_id, p_latitude, p_longitude, p_accuracy, p_heading, p_speed)
  ON CONFLICT (driver_id) 
  DO UPDATE SET
    order_id = EXCLUDED.order_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    accuracy = EXCLUDED.accuracy,
    heading = EXCLUDED.heading,
    speed = EXCLUDED.speed,
    updated_at = now()
  RETURNING id INTO v_location_id;

  RETURN v_location_id;
END;
$$;

-- Add unique constraint on driver_id for upsert
ALTER TABLE public.driver_locations ADD CONSTRAINT driver_locations_driver_id_unique UNIQUE (driver_id);