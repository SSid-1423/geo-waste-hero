import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Navigation() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (user && profile) {
      navigate(`/dashboard/${profile.role}`);
    } else {
      navigate('/auth');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-hero rounded-full">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              WasteWise
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">
              Roles
            </a>
            <a href="#impact" className="text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </a>
            {user && profile ? (
              <Button variant="hero" onClick={handleAuthAction}>
                <User className="mr-2 h-4 w-4" />
                {profile.role === 'citizen' ? 'My Dashboard' : 
                 profile.role === 'government' ? 'Gov Dashboard' : 
                 'Municipality Dashboard'}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a 
              href="#features" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#roles" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Roles
            </a>
            <a 
              href="#impact" 
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Impact
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              {user && profile ? (
                <Button variant="hero" className="w-full" onClick={handleAuthAction}>
                  <User className="mr-2 h-4 w-4" />
                  {profile.role === 'citizen' ? 'My Dashboard' : 
                   profile.role === 'government' ? 'Gov Dashboard' : 
                   'Municipality Dashboard'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                    Sign In
                  </Button>
                  <Button variant="hero" className="w-full" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}