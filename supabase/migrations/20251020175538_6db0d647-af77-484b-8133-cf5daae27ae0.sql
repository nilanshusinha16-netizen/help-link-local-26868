-- First, drop all existing policies on aid_requests
DROP POLICY IF EXISTS "Anyone can view open requests or their own requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users and donors can view relevant requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users can update own requests or claim others' requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.aid_requests;

-- Create a simple SELECT policy that allows anyone to view open requests
-- and allows users to view their own requests or requests they've claimed
CREATE POLICY "Anyone can view open requests"
ON public.aid_requests
FOR SELECT
USING (
  status = 'open' 
  OR auth.uid() = user_id 
  OR auth.uid() = claimed_by
);

-- Recreate INSERT policy
CREATE POLICY "Authenticated users can create requests"
ON public.aid_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy that prevents users from claiming their own requests
CREATE POLICY "Users can update requests"
ON public.aid_requests
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (status = 'open' AND auth.uid() != user_id)
)
WITH CHECK (
  auth.uid() = user_id 
  OR (auth.uid() = claimed_by AND auth.uid() != user_id)
);