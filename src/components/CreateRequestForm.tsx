import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface CreateRequestFormProps {
  userId: string;
  onSuccess: () => void;
}

export const CreateRequestForm = ({ userId, onSuccess }: CreateRequestFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("aid_requests").insert({
        user_id: userId,
        title,
        description,
        status: "open",
        category: "food",
        urgency: "medium",
        location_lat: 0,
        location_lng: 0,
        location_address: "Not specified",
      });

      if (error) throw error;

      toast({ title: "Request created successfully!" });
      setTitle("");
      setDescription("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Request</CardTitle>
        <CardDescription>Post a request for help</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need help with?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
