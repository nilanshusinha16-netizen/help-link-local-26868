import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import OpenStreetMap from '@/components/OpenStreetMap';
import FloatingActionButton from '@/components/FloatingActionButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MapView = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('aid_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Map View</h1>
          <p className="text-muted-foreground">
            View all open requests on the map
          </p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <OpenStreetMap requests={requests} />
        )}
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default MapView;
