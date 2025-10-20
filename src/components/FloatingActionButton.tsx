import { Plus, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/integrations/supabase/auth';

const FloatingActionButton = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <Link to="/map">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          variant="secondary"
        >
          <Map className="h-6 w-6" />
        </Button>
      </Link>
      <Link to="/dashboard/new-request">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
};

export default FloatingActionButton;
