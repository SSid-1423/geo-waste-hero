import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  value: string;
  label: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "accent" | "success" | "warning";
}

export function StatsCard({ value, label, description, trend, color = "primary" }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "secondary":
        return "text-secondary";
      case "accent":
        return "text-accent";
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      default:
        return "text-primary";
    }
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "";
  };

  return (
    <Card className="hover:shadow-soft transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-3xl font-bold ${getColorClasses()}`}>
              {value}
              {trend && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {getTrendIcon()}
                </span>
              )}
            </p>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}