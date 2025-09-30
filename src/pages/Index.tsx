import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleCard } from "@/components/RoleCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Building2, 
  UserCheck, 
  Camera, 
  MapPin, 
  Recycle, 
  Award, 
  Shield,
  Leaf,
  Globe,
  Target,
  BookOpen,
  Store,
  TrendingUp,
  Bell,
  Truck
} from "lucide-react";
import heroImage from "@/assets/hero-waste-management.jpg";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user && profile) {
      navigate(`/dashboard/${profile.role}`);
    }
  }, [user, profile, navigate]);

  const handleRoleSelect = (role: "citizen" | "government" | "municipality") => {
    if (user && profile) {
      // If user is logged in, go to dashboard
      navigate(`/dashboard/${profile.role}`);
    } else {
      // If not logged in, go to auth page
      navigate('/auth');
    }
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto">
        <Navigation />

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${heroImage})` }}
          ></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge variant="secondary" className="w-fit">
                  🌱 Sustainable Future Initiative
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                  Transform Waste into
                  <br />
                  <span className="text-accent">Opportunity</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Join the revolution in waste management. Report, track, and resolve waste issues 
                  in your community with our comprehensive monitoring system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="hero" className="text-lg px-8 py-4" onClick={handleGetStarted}>
                    Get Started Today
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4" onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Smart waste management monitoring" 
                  className="rounded-2xl shadow-strong w-full"
                />
                <div className="absolute inset-0 bg-gradient-primary/20 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Comprehensive Waste Management
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our platform connects citizens, government officials, and municipality teams 
                for efficient waste monitoring and resolution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <FeatureCard
                title="Photo Reports"
                description="Upload geo-tagged photos of waste issues"
                icon={Camera}
                gradient="bg-gradient-primary"
              />
              <FeatureCard
                title="Real-time Tracking"
                description="Monitor cleanup progress live"
                icon={MapPin}
                gradient="bg-gradient-secondary"
              />
              <FeatureCard
                title="Training Modules"
                description="Learn proper waste segregation"
                icon={BookOpen}
                gradient="bg-gradient-primary"
              />
              <FeatureCard
                title="Smart Analytics"
                description="Data-driven insights for better decisions"
                icon={TrendingUp}
                gradient="bg-gradient-secondary"
              />
            </div>
          </div>
        </section>

        {/* Role Selection Section */}
        <section id="roles" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Choose Your Role
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Access tailored features designed for your specific role in waste management
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <RoleCard
                title="Citizens"
                description="Report waste issues and track their resolution"
                icon={Users}
                variant="citizen"
                features={[
                  "Report waste with photos",
                  "Track cleanup status",
                  "Access training modules",
                  "Earn rewards points",
                  "Buy waste utilities"
                ]}
                onClick={() => handleRoleSelect("citizen")}
              />

              <RoleCard
                title="Government"
                description="Verify reports and manage operations"
                icon={Shield}
                variant="government"
                features={[
                  "Verify citizen reports",
                  "Assign cleanup tasks",
                  "Monitor dashboards",
                  "Generate analytics",
                  "Manage penalties"
                ]}
                onClick={() => handleRoleSelect("government")}
              />

              <RoleCard
                title="Municipality"
                description="Execute cleanup operations efficiently"
                icon={Truck}
                variant="municipality"
                features={[
                  "Receive task assignments",
                  "Update completion status",
                  "Track team activities",
                  "Upload proof photos",
                  "Manage resources"
                ]}
                onClick={() => handleRoleSelect("municipality")}
              />
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 bg-gradient-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Making Real Impact
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of users already making a difference in their communities
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <Card className="text-center border-none bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-muted-foreground">Reports Resolved</div>
                </CardContent>
              </Card>
              <Card className="text-center border-none bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">12K+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </CardContent>
              </Card>
              <Card className="text-center border-none bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">200+</div>
                  <div className="text-muted-foreground">Cities Covered</div>
                </CardContent>
              </Card>
              <Card className="text-center border-none bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-muted-foreground">Resolution Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Simple 4-step process for effective waste management
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Report", description: "Citizens report waste with photos and location", icon: Camera },
                { step: "2", title: "Verify", description: "Government verifies and categorizes reports", icon: UserCheck },
                { step: "3", title: "Assign", description: "Tasks assigned to municipality teams", icon: Target },
                { step: "4", title: "Complete", description: "Teams complete cleanup and update status", icon: Award }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the waste management revolution and help build cleaner, more sustainable communities.
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              <Recycle className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold">WasteWise</span>
                </div>
                <p className="text-sm text-background/70">
                  Transforming waste management through technology and community collaboration.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-sm text-background/70">
                  <li>Waste Reporting</li>
                  <li>Real-time Tracking</li>
                  <li>Training Modules</li>
                  <li>Analytics Dashboard</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-background/70">
                  <li>Help Center</li>
                  <li>Contact Us</li>
                  <li>Training Resources</li>
                  <li>API Documentation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-background/70">
                  <li>About Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>
                    <button 
                      onClick={() => navigate('/careers')} 
                      className="hover:text-background transition-colors"
                    >
                      Careers
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/70">
              <p>&copy; 2024 WasteWise. All rights reserved. Built for a sustainable future.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;