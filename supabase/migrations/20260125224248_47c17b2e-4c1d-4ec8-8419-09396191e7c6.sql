-- Исправляем search_path для функции генерации токена
CREATE OR REPLACE FUNCTION public.generate_lead_rating_token()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.rating_token := encode(gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$;