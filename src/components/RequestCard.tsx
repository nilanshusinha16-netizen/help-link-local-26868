import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  locationAddress: string;
  imageUrl?: string;
  createdAt: string;
  userProfile?: {
    full_name: string;
  };
  onClaim?: () => void;
  onView?: () => void;
}

const urgencyColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-secondary text-secondary-foreground',
  high: 'bg-primary text-primary-foreground',
  critical: 'bg-urgent text-urgent-foreground',
};

const statusColors = {
  open: 'bg-accent text-accent-foreground',
  claimed: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-secondary text-secondary-foreground',
  fulfilled: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const RequestCard = ({
  title,
  description,
  category,
  urgency,
  status,
  locationAddress,
  imageUrl,
  createdAt,
  userProfile,
  onClaim,
  onView,
}: RequestCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
          <Badge className={urgencyColors[urgency as keyof typeof urgencyColors]}>
            {urgency}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="capitalize">
            {category.replace('_', ' ')}
          </Badge>
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{locationAddress}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{userProfile?.full_name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onView && (
          <Button variant="outline" className="flex-1" onClick={onView}>
            View Details
          </Button>
        )}
        {onClaim && status === 'open' && (
          <Button className="flex-1" onClick={onClaim}>
            Claim Request
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
