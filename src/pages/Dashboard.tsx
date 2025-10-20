import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '@/components/Navbar';
import RequestCard from '@/components/RequestCard';
import HelperLocationSetup from '@/components/HelperLocationSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FloatingActionButton from '@/components/FloatingActionButton';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDonor, isRecipient, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [claimedRequests, setClaimedRequests] = useState<any[]>([]);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !roleLoading) {
      fetchDashboardData();
    }
  }, [user, roleLoading]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isRecipient) {
        const myRequestsData = await supabase
          .from('aid_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (myRequestsData.error) throw myRequestsData.error;
        setMyRequests(myRequestsData.data || []);
      } else if (isDonor) {
        const [availableData, claimedData] = await Promise.all([
          supabase
            .from('aid_requests')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false }),
          supabase
            .from('aid_requests')
            .select('*')
            .eq('claimed_by', user.id)
            .order('claimed_at', { ascending: false }),
        ]);

        if (availableData.error) throw availableData.error;
        if (claimedData.error) throw claimedData.error;

        setAvailableRequests(availableData.data || []);
        setClaimedRequests(claimedData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('aid_requests')
        .update({ 
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
          status: 'claimed'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request claimed! The user will be notified.');
      fetchDashboardData();
    } catch (error) {
      console.error('Error claiming request:', error);
      toast.error('Failed to claim request');
    }
  };

  if (authLoading || loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isDonor ? 'Helper Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isDonor ? 'View and claim requests within 50km' : 'Track your requests and contributions'}
          </p>
        </div>

        {isDonor && <HelperLocationSetup />}

        {isRecipient ? (
          <Tabs defaultValue="my-requests" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
              <TabsTrigger value="claimed">Helping ({claimedRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="my-requests" className="mt-8">
              {myRequests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground mb-4">You haven't posted any requests yet</p>
                  <Link to="/new-request">
                    <Button>Post Your First Request</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRequests.map((request) => (
                    <div key={request.id} className="relative">
                      <RequestCard
                        {...request}
                        locationAddress={request.location_address}
                        imageUrl={request.image_url}
                        createdAt={request.created_at}
                        userProfile={{ full_name: 'Anonymous' }}
                      />
                      {request.claimed_by && (
                        <div className="mt-2 p-3 bg-primary/10 text-primary rounded-lg text-sm">
                          ✓ Update is on the way! Someone has claimed this request.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claimed" className="mt-8">
              {claimedRequests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground mb-4">You haven't claimed any requests yet</p>
                  <Link to="/browse">
                    <Button>Browse Requests</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claimedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      {...request}
                      locationAddress={request.location_address}
                      imageUrl={request.image_url}
                      createdAt={request.created_at}
                      userProfile={{ full_name: 'Anonymous' }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="available">Available Requests ({availableRequests.length})</TabsTrigger>
              <TabsTrigger value="claimed">My Claims ({claimedRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-8">
              {availableRequests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">No requests available within 50km</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back later or expand your search area</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      {...request}
                      locationAddress={request.location_address}
                      imageUrl={request.image_url}
                      createdAt={request.created_at}
                      userProfile={{ full_name: 'Anonymous' }}
                      onClaim={() => handleClaim(request.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claimed" className="mt-8">
              {claimedRequests.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground mb-4">You haven't claimed any requests yet</p>
                  <p className="text-sm text-muted-foreground">Browse available requests to start helping</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claimedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      {...request}
                      locationAddress={request.location_address}
                      imageUrl={request.image_url}
                      createdAt={request.created_at}
                      userProfile={{ full_name: 'Anonymous' }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
