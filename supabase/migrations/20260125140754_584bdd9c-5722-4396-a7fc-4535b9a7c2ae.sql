-- Fix: Remove client-side role assignment vulnerability
-- Always assign 'customer' role to new users - admin roles must be assigned by admins only

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with safe metadata only
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- SECURITY FIX: Always assign 'customer' role
  -- Never trust client-supplied role data
  -- Admin/driver roles must be assigned by admins through a secure admin interface
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer'::public.app_role);
  
  -- Create app settings
  INSERT INTO public.app_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;