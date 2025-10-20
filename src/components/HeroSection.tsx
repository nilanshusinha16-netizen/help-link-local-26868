import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Users, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <img src={logo} alt="AidBridge" className="h-5 w-5" />
              <span className="text-sm font-medium text-primary">Connecting Communities</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Bridge the Gap Between
              <span className="text-primary"> Need & Help</span>
            </h1>
            
            <p className="text-xl text-muted-foreground">
              AidBridge makes community aid faster, more transparent, and location-aware. 
              Post a request for help or volunteer to make a difference in your community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline">
                  Browse Requests
                </Button>
              </Link>
            </div>
            
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Local Helpers</p>
                  <p className="text-sm text-muted-foreground">Verified volunteers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Location-Based</p>
                  <p className="text-sm text-muted-foreground">Help nearby</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 backdrop-blur-sm border border-primary/20">
              <div className="h-full w-full rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <img src={logo} alt="AidBridge" className="h-20 w-20 mx-auto" />
                  <h3 className="text-2xl font-bold">Help is Just a Click Away</h3>
                  <p className="text-muted-foreground">Join our community of helpers and those in need</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-secondary/20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
