import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import Navbar from '@/components/Navbar';
import RequestCard from '@/components/RequestCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FloatingActionButton from '@/components/FloatingActionButton';
import HelperLocationSetup from '@/components/HelperLocationSetup';

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aid_requests',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, urgencyFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('aid_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      if (urgencyFilter !== 'all') {
        query = query.eq('urgency', urgencyFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (requestId: string) => {
    if (!user) {
      toast.error('Please sign in to claim requests');
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('aid_requests')
        .update({
          status: 'claimed',
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request claimed successfully!');
      fetchRequests();
    } catch (error) {
      console.error('Error claiming request:', error);
      toast.error('Failed to claim request');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <HelperLocationSetup />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Requests</h1>
          <p className="text-muted-foreground">Find ways to help in your community</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="shelter">Shelter</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-[180px]">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No requests found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
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
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default Browse;
