import { format } from "date-fns";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  claimed_by: string | null;
  created_at: string;
  user_id: string;
  category?: string;
  urgency?: string;
}

interface RequestCardProps {
  request: Request;
  currentUserId: string;
  onClaim: () => void;
}

export const RequestCard = ({ request, currentUserId, onClaim }: RequestCardProps) => {
  const { toast } = useToast();
  const isOwner = request.user_id === currentUserId;
  const isClaimed = request.status === "claimed" || request.claimed_by !== null;

  const handleClaim = async () => {
    try {
      const { error: updateError } = await supabase
        .from("aid_requests")
        .update({
          claimed_by: currentUserId,
          status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Create notification for request owner
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.user_id,
          request_id: request.id,
          message: `Your request "${request.title}" has been claimed!`,
        });

      if (notificationError) throw notificationError;

      toast({ title: "Request claimed successfully!" });
      onClaim();
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
            <CardTitle className="text-xl">{request.title}</CardTitle>
            <CardDescription>
              Posted {format(new Date(request.created_at), "MMM d, yyyy")}
            </CardDescription>
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
        <p className="text-muted-foreground">{request.description}</p>
        {request.category && (
          <div className="mt-3">
            <Badge variant="outline">{request.category}</Badge>
          </div>
        )}
      </CardContent>
      {!isOwner && !isClaimed && (
        <CardFooter>
          <Button onClick={handleClaim} className="w-full">
            Claim Request
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
