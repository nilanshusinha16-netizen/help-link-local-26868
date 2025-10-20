import { useEffect, useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const HelperLocationSetup = () => {
  const { user } = useAuth();
  const { isDonor, loading: roleLoading } = useUserRole();
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(true);

  useEffect(() => {
    checkUserLocation();
  }, [user, isDonor]);

  const checkUserLocation = async () => {
    if (!user || !isDonor) {
      setCheckingLocation(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location_lat, location_lng')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setHasLocation(!!(data?.location_lat && data?.location_lng));
    } catch (error) {
      console.error('Error checking location:', error);
    } finally {
      setCheckingLocation(false);
    }
  };

  const saveCurrentLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { error } = await supabase
              .from('profiles')
              .update({
                location_lat: position.coords.latitude,
                location_lng: position.coords.longitude,
              })
              .eq('id', user!.id);

            if (error) throw error;

            setHasLocation(true);
            toast.success('Location saved! You can now see requests within 50km.');
          } catch (error) {
            console.error('Error saving location:', error);
            toast.error('Failed to save location');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  if (roleLoading || checkingLocation) {
    return null;
  }

  if (!isDonor || hasLocation) {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Set Your Location
        </CardTitle>
        <CardDescription>
          As a helper, you need to share your location to see requests within 50km of you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={saveCurrentLocation} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Share My Location
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HelperLocationSetup;
