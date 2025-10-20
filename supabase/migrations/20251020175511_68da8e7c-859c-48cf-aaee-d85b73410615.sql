-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users and donors can view relevant requests" ON public.aid_requests;

-- Create a simpler SELECT policy that allows anyone to view open requests
-- and allows users to view their own requests or requests they've claimed
CREATE POLICY "Anyone can view open requests or their own requests"
ON public.aid_requests
FOR SELECT
USING (
  status = 'open' 
  OR auth.uid() = user_id 
  OR auth.uid() = claimed_by
);

-- Add a check to prevent users from claiming their own requests
-- by updating the UPDATE policy to include this restriction
DROP POLICY IF EXISTS "Users can update own requests" ON public.aid_requests;

CREATE POLICY "Users can update own requests or claim others' requests"
ON public.aid_requests
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (auth.uid() = claimed_by AND auth.uid() != user_id)
)
WITH CHECK (
  auth.uid() = user_id 
  OR (auth.uid() = claimed_by AND auth.uid() != user_id)
);