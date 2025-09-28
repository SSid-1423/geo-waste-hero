import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onClick: () => void;
  variant?: "citizen" | "government" | "municipality";
}

export function RoleCard({ title, description, icon: Icon, features, onClick, variant = "citizen" }: RoleCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "government":
        return "hover:shadow-medium border-secondary/20 hover:border-secondary/40";
      case "municipality":
        return "hover:shadow-medium border-accent/20 hover:border-accent/40";
      default:
        return "hover:shadow-medium border-primary/20 hover:border-primary/40";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "government":
        return "secondary" as const;
      case "municipality":
        return "accent" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:scale-105 ${getVariantStyles()}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-surface">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          className="w-full" 
          size="lg" 
          variant={getButtonVariant()}
          onClick={onClick}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}