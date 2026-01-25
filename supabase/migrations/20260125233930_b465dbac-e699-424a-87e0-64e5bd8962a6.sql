-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the function to ensure it has correct permissions
CREATE OR REPLACE FUNCTION public.generate_lead_rating_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.rating_token := encode(gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$;