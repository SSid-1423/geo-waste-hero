import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { RoleCard } from "@/components/RoleCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/pages/Dashboard";
import heroImage from "@/assets/hero-waste-management.jpg";
import { 
  Users, 
  Shield, 
  Truck, 
  Camera, 
  MapPin, 
  BookOpen, 
  Store, 
  TrendingUp,
  Recycle,
  Globe,
  Award,
  Bell
} from "lucide-react";

type UserRole = "citizen" | "government" | "municipality" | null;

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (selectedRole) {
    return <Dashboard role={selectedRole} onBack={() => setSelectedRole(null)} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Smart <span className="bg-gradient-hero bg-clip-text text-transparent">Waste</span> Management for a Cleaner Future
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Empowering citizens, government, and municipalities to work together for efficient waste management and environmental monitoring.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg">
                  Get Started Today
                  <Globe className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  Government Certified
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  10K+ Active Users
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-up">
              <img 
                src={heroImage} 
                alt="Smart waste management and environmental monitoring" 
                className="rounded-2xl shadow-strong w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="get-started" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Choose Your <span className="bg-gradient-hero bg-clip-text text-transparent">Role</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select your role to access tailored features designed for your specific needs in waste management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 animate-scale-in">
            <RoleCard
              title="Citizens"
              description="Report waste and access training"
              icon={Users}
              variant="citizen"
              features={[
                "Report waste with geo-tagged photos",
                "Track cleanup status",
                "Access training modules",
                "Shop for waste utilities",
                "Earn rewards for participation"
              ]}
              onClick={() => setSelectedRole("citizen")}
            />
            
            <RoleCard
              title="Government"
              description="Verify reports and track analytics"
              icon={Shield}
              variant="government"
              features={[
                "Verify citizen reports",
                "Assign tasks to teams",
                "Monitor live dashboards",
                "Generate analytics",
                "Manage penalties & fines"
              ]}
              onClick={() => setSelectedRole("government")}
            />
            
            <RoleCard
              title="Municipality"
              description="Execute cleanup operations"
              icon={Truck}
              variant="municipality"
              features={[
                "Receive cleanup assignments",
                "Update task status",
                "Track collection vehicles",
                "Upload completion proof",
                "Manage waste processing"
              ]}
              onClick={() => setSelectedRole("municipality")}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful <span className="bg-gradient-hero bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need for efficient waste management and environmental monitoring
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="Geo-tagging"
              description="Real-time location tracking for waste reports"
              icon={MapPin}
              gradient="bg-gradient-primary"
            />
            <FeatureCard
              title="Photo Reports"
              description="Visual documentation of waste issues"
              icon={Camera}
              gradient="bg-gradient-secondary"
            />
            <FeatureCard
              title="Training Hub"
              description="Educational modules for proper waste management"
              icon={BookOpen}
              gradient="bg-gradient-primary"
            />
            <FeatureCard
              title="Utility Shop"
              description="Purchase waste management tools and equipment"
              icon={Store}
              gradient="bg-gradient-secondary"
            />
            <FeatureCard
              title="Live Tracking"
              description="Monitor cleanup progress in real-time"
              icon={TrendingUp}
              gradient="bg-gradient-primary"
            />
            <FeatureCard
              title="Smart Notifications"
              description="Stay updated with push notifications"
              icon={Bell}
              gradient="bg-gradient-secondary"
            />
            <FeatureCard
              title="Recycling Programs"
              description="Promote sustainable waste disposal methods"
              icon={Recycle}
              gradient="bg-gradient-primary"
            />
            <FeatureCard
              title="Community Movement"
              description="Engage citizens in environmental initiatives"
              icon={Globe}
              gradient="bg-gradient-secondary"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="bg-gradient-hero bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple, efficient workflow connecting citizens, government, and municipality teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Report", description: "Citizens report waste with photos and location" },
              { step: "2", title: "Verify", description: "Government verifies and categorizes reports" },
              { step: "3", title: "Assign", description: "Tasks assigned to municipality cleanup teams" },
              { step: "4", title: "Complete", description: "Status updated with completion proof" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white text-xl font-bold">
                  {item.step}
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens, government officials, and municipality teams working together for a cleaner environment
          </p>
          <Button variant="secondary" size="lg" className="text-lg">
            Start Your Journey
            <Recycle className="ml-2 h-5 w-5" />
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
                  <Recycle className="h-4 w-4 text-white" />
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
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/70">
            <p>&copy; 2024 WasteWise. All rights reserved. Built for a sustainable future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
