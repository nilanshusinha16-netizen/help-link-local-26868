-- Update distance radius from 30km to 50km in RLS policy
DROP POLICY IF EXISTS "Users and donors can view relevant requests" ON aid_requests;

CREATE POLICY "Users and donors can view relevant requests" 
ON aid_requests 
FOR SELECT 
USING (
  status = 'open'::request_status 
  AND (
    has_role(auth.uid(), 'recipient'::app_role)
    OR (
      has_role(auth.uid(), 'donor'::app_role) 
      AND EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND location_lat IS NOT NULL 
        AND location_lng IS NOT NULL 
        AND calculate_distance(location_lat, location_lng, aid_requests.location_lat, aid_requests.location_lng) <= 50
      )
    )
    OR auth.uid() IS NULL
  )
);