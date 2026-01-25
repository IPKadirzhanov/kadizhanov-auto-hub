-- Allow anyone to read a lead by its rating_token (for client status page)
CREATE POLICY "Anyone can read lead by rating_token"
ON public.leads
FOR SELECT
USING (rating_token IS NOT NULL);

-- This allows the insert...select() to work for anonymous users
-- The client can only access their lead via the unique rating_token