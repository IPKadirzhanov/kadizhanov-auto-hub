-- Allow users to read their own role without admin check (prevents circular dependency)
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);