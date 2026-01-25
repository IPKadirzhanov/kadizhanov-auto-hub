-- Allow clients to view profiles of managers assigned to their leads
CREATE POLICY "Clients can view assigned manager profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.client_user_id = auth.uid() 
    AND leads.assigned_manager_id = profiles.user_id
  )
);

-- Also allow managers to view each other's profiles (for team visibility)
CREATE POLICY "Managers can view other manager profiles"
ON public.profiles
FOR SELECT
USING (
  is_manager() AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = profiles.user_id 
    AND user_roles.role = 'manager'
  )
);