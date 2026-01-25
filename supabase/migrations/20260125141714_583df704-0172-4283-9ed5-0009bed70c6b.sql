-- Secure role assignment: Only allow 'customer' or 'driver' from client metadata
-- 'admin' role must be assigned by admins only through secure admin interface

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
  final_role public.app_role;
BEGIN
  -- Get the requested role from metadata
  requested_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', 'customer')));
  
  -- SECURITY: Only allow 'customer' or 'driver' roles from client
  -- 'admin' role cannot be self-assigned - must be granted by existing admin
  IF requested_role = 'driver' THEN
    final_role := 'driver'::public.app_role;
  ELSE
    -- Default to 'customer' for any other value including 'admin' attempts
    final_role := 'customer'::public.app_role;
  END IF;
  
  -- Create profile with safe metadata only
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign validated role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, final_role);
  
  -- Create app settings
  INSERT INTO public.app_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;