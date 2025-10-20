import { HandHeart, MapPin, Bell, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: HandHeart,
    title: 'Request & Claim',
    description: 'Post requests for help or claim existing ones. Simple, transparent, and effective.',
    color: 'primary',
  },
  {
    icon: MapPin,
    title: 'Location-Based',
    description: 'Find help near you with our interactive map integration. Distance matters.',
    color: 'secondary',
  },
  {
    icon: Bell,
    title: 'Real-Time Updates',
    description: 'Get notified when requests are posted, claimed, or fulfilled in your area.',
    color: 'accent',
  },
  {
    icon: TrendingUp,
    title: 'Track Impact',
    description: 'See the difference you make with detailed analytics and progress tracking.',
    color: 'primary',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How AidBridge Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple platform connecting those in need with those who can help
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`h-12 w-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
