-- Extend the existing public_profiles view to safely expose vehicle_type (without exposing sensitive profile fields)
-- This allows customers to read a driver's vehicle type while keeping email/phone private.

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.vehicle_type
FROM public.profiles p;

-- Ensure the frontend (anon/authenticated) can read from this view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
