import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  requests?: any[];
}

const OpenStreetMap = ({ requests = [] }: MapProps) => {
  const validRequests = requests.filter(
    (req) => req.location_lat !== null && req.location_lng !== null && req.location_lat !== 0 && req.location_lng !== 0
  );

  const center: [number, number] = validRequests.length > 0
    ? [validRequests[0].location_lat, validRequests[0].location_lng]
    : [20.5937, 78.9629]; // India center

  if (validRequests.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No requests with valid locations found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validRequests.map((request) => (
          <Marker
            key={request.id}
            position={[request.location_lat, request.location_lng]}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{request.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{request.category}</p>
                <p style={{ fontSize: '12px' }}>{request.location_address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
