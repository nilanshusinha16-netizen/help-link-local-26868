import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import RequestCard from './RequestCard';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('aid_requests')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (requests.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Recent Requests</h2>
            <p className="text-muted-foreground">Help someone in your community today</p>
          </div>
          <Link to="/browse">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              {...request}
              locationAddress={request.location_address}
              imageUrl={request.image_url}
              createdAt={request.created_at}
              userProfile={request.profiles}
              onView={() => window.location.href = `/browse`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentRequests;
