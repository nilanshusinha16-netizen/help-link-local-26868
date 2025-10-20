import { format } from "date-fns";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/integrations/supabase/auth";

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
  onClaim,
}: RequestCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isOwner = user_id === user?.id;
  const isClaimed = status === "claimed" || claimed_by !== null;
  const displayDate = created_at || createdAt;

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
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        {category && (
          <div className="mt-3">
            <Badge variant="outline">{category}</Badge>
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
