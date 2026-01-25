-- Add client_user_id to leads table to link leads to registered clients
ALTER TABLE public.leads
ADD COLUMN client_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX idx_leads_client_user_id ON public.leads(client_user_id);

-- Allow clients to see their own leads (by client_user_id)
CREATE POLICY "Clients can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = client_user_id);

-- Allow clients to create leads linked to themselves
CREATE POLICY "Clients can create leads linked to themselves"
ON public.leads
FOR INSERT
WITH CHECK (
  -- Either anonymous (no auth) or authenticated client creating their own lead
  (auth.uid() IS NULL) OR (client_user_id = auth.uid() OR client_user_id IS NULL)
);