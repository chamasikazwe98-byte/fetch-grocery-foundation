-- Fix: recreate public_profiles view with security_invoker to avoid security definer warning
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.vehicle_type
FROM public.profiles p;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
