import { format } from "date-fns";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/integrations/supabase/auth";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapPin } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RequestCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  claimed_by?: string | null;
  created_at?: string;
  createdAt?: string;
  user_id: string;
  category?: string;
  urgency?: string;
  location_address?: string;
  locationAddress?: string;
  location_lat?: number;
  location_lng?: number;
  image_url?: string;
  imageUrl?: string;
  userProfile?: { full_name?: string };
  onClaim?: () => void;
  onView?: () => void;
}

export const RequestCard = ({
  id,
  title,
  description,
  status,
  claimed_by,
  created_at,
  createdAt,
  user_id,
  category,
  urgency,
  location_address,
  location_lat,
  location_lng,
  onClaim,
}: RequestCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const isOwner = user_id === user?.id;
  const isClaimed = status === "claimed" || claimed_by !== null;
  const displayDate = created_at || createdAt;
  const hasValidLocation = location_lat && location_lng && location_lat !== 0 && location_lng !== 0;

  const handleClaim = async () => {
    if (!user) {
      toast({ 
        title: "Authentication required", 
        description: "Please sign in to claim requests",
        variant: "destructive" 
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("aid_requests")
        .update({
          claimed_by: user.id,
          status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Create notification for request owner
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user_id,
          request_id: id,
          message: `Your request "${title}" has been claimed!`,
        });

      if (notificationError) throw notificationError;

      toast({ title: "Request claimed successfully!" });
      if (onClaim) onClaim();
    } catch (error: any) {
      toast({
        title: "Error claiming request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="animate-fade-in hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {displayDate && (
              <CardDescription>
                Posted {format(new Date(displayDate), "MMM d, yyyy")}
              </CardDescription>
            )}
          </div>
          <Badge
            variant={isClaimed ? "secondary" : "default"}
            className={isClaimed ? "bg-[hsl(var(--success))]" : ""}
          >
            {isClaimed ? "Claimed" : "Open"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          {category && <Badge variant="outline">{category}</Badge>}
          {urgency && (
            <Badge 
              variant={urgency === 'critical' ? 'destructive' : urgency === 'high' ? 'default' : 'secondary'}
            >
              {urgency}
            </Badge>
          )}
        </div>

        {location_address && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{location_address}</span>
            </div>
            
            {hasValidLocation && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {showMap ? 'Hide Map' : 'View Location on Map'}
                </Button>
                
                {showMap && (
                  <div className="h-[200px] rounded-lg overflow-hidden border">
                    <MapContainer
                      key={`request-map-${id}`}
                      center={[location_lat, location_lng]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                      dragging={false}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[location_lat, location_lng]} />
                    </MapContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
      {!isOwner && !isClaimed && user && (
        <CardFooter>
          <Button onClick={handleClaim} className="w-full">
            Claim Request
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
