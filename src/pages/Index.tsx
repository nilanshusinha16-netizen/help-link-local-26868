import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { AuthForm } from "@/components/AuthForm";
import { NotificationBar } from "@/components/NotificationBar";
import { RequestCard } from "@/components/RequestCard";
import { CreateRequestForm } from "@/components/CreateRequestForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("aid_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  const myRequests = requests.filter((req) => req.user_id === user.id);
  const browseRequests = requests.filter((req) => {
    if (req.user_id === user.id) return false;
    if (req.status !== "open") return false;
    if (categoryFilter !== "all" && req.category !== categoryFilter) return false;
    if (urgencyFilter !== "all" && req.urgency !== urgencyFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-20">
      <NotificationBar />
      
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Help Requests</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="my-requests" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="browse">Browse Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="space-y-8">
            <div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {showCreateForm ? "Cancel" : "Create Request"}
              </Button>
            </div>

            {showCreateForm && (
              <div className="animate-fade-in">
                <CreateRequestForm
                  userId={user.id}
                  onSuccess={() => {
                    setShowCreateForm(false);
                    fetchRequests();
                  }}
                />
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  {...request}
                  onClaim={fetchRequests}
                />
              ))}
            </div>

            {myRequests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No requests yet. Create one to get started!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {browseRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  {...request}
                  onClaim={fetchRequests}
                />
              ))}
            </div>

            {browseRequests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No requests available to browse right now.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
