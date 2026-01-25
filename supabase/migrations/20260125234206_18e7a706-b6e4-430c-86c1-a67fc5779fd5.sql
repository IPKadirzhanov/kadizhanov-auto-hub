-- Create trigger to generate rating token on lead insert
DROP TRIGGER IF EXISTS generate_lead_rating_token_trigger ON public.leads;

CREATE TRIGGER generate_lead_rating_token_trigger
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.generate_lead_rating_token();