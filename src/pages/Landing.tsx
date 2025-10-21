import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Users, HandHeart, Shield, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <Heart className="h-20 w-20 text-primary animate-pulse" fill="currentColor" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Welcome to <span className="text-primary">AidBridge</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connecting communities through compassion. Request help or offer assistance to those in need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How AidBridge Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple platform that bridges the gap between those who need help and those ready to give it
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <HandHeart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Request Help</h3>
              <p className="text-muted-foreground">
                Need assistance? Create a request with details about what you need. Whether it's food, shelter, medical aid, or other support.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Provide Assistance</h3>
              <p className="text-muted-foreground">
                Want to help? Browse requests in your area and claim the ones you can fulfill. Make a direct impact in your community.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Location-Based</h3>
              <p className="text-muted-foreground">
                View requests on an interactive map. Find opportunities to help nearby or see who needs assistance in your area.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Your data is protected with industry-standard security. Verified accounts ensure trust and safety for all users.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Get instant notifications when your request is claimed or when new requests match your interests.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover-scale">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Community Driven</h3>
              <p className="text-muted-foreground">
                Built on compassion and trust. Track your impact and see the difference you're making in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Make a Difference?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of people helping their communities through AidBridge
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <p className="text-muted-foreground">
              © 2025 AidBridge. Building stronger communities together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
