import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from './ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const LocationPicker = ({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          setShowMap(true); // Show map with current location
          
          // Reverse geocoding using Nominatim (OpenStreetMap)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.display_name || `${lat}, ${lng}`;
            onLocationSelect(lat, lng, address);
            toast({ title: 'Current location found! Confirm to use this location.' });
          } catch (error) {
            console.error('Error getting address:', error);
            onLocationSelect(lat, lng, `${lat}, ${lng}`);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({ 
            title: 'Location Error',
            description: 'Could not get your location. Please enable location services.',
            variant: 'destructive'
          });
          setLoading(false);
        }
      );
    } else {
      toast({ 
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleMapSelection = async () => {
    if (!position) {
      toast({ 
        title: 'No Location Selected',
        description: 'Please click on the map to select a location',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`
      );
      const data = await response.json();
      const address = data.display_name || `${position[0]}, ${position[1]}`;
      onLocationSelect(position[0], position[1], address);
      setShowMap(false);
      toast({ title: 'Location selected!' });
    } catch (error) {
      console.error('Error getting address:', error);
      onLocationSelect(position[0], position[1], `${position[0]}, ${position[1]}`);
      setShowMap(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          Use Current Location
        </Button>
        <Button
          type="button"
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          className="flex-1"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showMap ? 'Hide Map' : 'Pick from Map'}
        </Button>
      </div>

      {showMap && (
        <div className="space-y-2">
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MapContainer
              key="location-picker-map"
              center={position || [20, 0]}
              zoom={position ? 13 : 2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          <Button
            type="button"
            onClick={handleMapSelection}
            disabled={!position || loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              'Confirm Location'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
