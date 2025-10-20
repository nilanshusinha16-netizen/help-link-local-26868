import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { NotificationBar } from "@/components/NotificationBar";
import { RequestCard } from "@/components/RequestCard";
import { CreateRequestForm } from "@/components/CreateRequestForm";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRequests();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await fetchRequests();
    }
    setLoading(false);
  };

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
    await supabase.auth.signOut();
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
    return <AuthForm onAuthSuccess={checkUser} />;
  }

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
        <div className="mb-8">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showCreateForm ? "Cancel" : "Create Request"}
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8 animate-fade-in">
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
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={user.id}
              onClaim={fetchRequests}
            />
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No requests yet. Create one to get started!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
