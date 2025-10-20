-- Drop existing enum and recreate with correct values
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('recipient', 'donor', 'admin', 'moderator');

-- Recreate user_roles table with new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Assign role from metadata: 'recipient' for users who need help, 'donor' for helpers
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'helper' THEN 'donor'
      ELSE 'recipient'
    END::app_role
  );
  
  RETURN new;
END;
$$;

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 NUMERIC,
  lng1 NUMERIC,
  lat2 NUMERIC,
  lng2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  earth_radius NUMERIC := 6371;
  dlat NUMERIC;
  dlng NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$;

-- Update RLS policy for distance-based filtering
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users and helpers can view relevant requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users and donors can view relevant requests" ON public.aid_requests;

CREATE POLICY "Users and donors can view relevant requests"
ON public.aid_requests
FOR SELECT
USING (
  status = 'open' AND (
    -- Recipients (users) can see all open requests
    public.has_role(auth.uid(), 'recipient') OR
    -- Donors (helpers) can only see requests within 30km
    (
      public.has_role(auth.uid(), 'donor') AND
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND location_lat IS NOT NULL
          AND location_lng IS NOT NULL
          AND public.calculate_distance(
            location_lat,
            location_lng,
            aid_requests.location_lat,
            aid_requests.location_lng
          ) <= 30
      )
    ) OR
    -- Not authenticated users can see all
    auth.uid() IS NULL
  )
);