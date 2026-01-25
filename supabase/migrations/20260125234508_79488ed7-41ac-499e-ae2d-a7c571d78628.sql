-- Update function to include extensions schema where gen_random_bytes lives
CREATE OR REPLACE FUNCTION public.generate_lead_rating_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.rating_token := encode(extensions.gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$;