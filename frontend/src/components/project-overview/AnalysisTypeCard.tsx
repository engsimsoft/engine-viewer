import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  LineChart,
  Volume2,
  Fan,
  History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Type for Lucide icon components
type IconComponent = typeof TrendingUp;

interface AnalysisTypeCardProps {
  id: string;
  title: string;
  description: string;
  href: string;
  available: boolean;
  calculationsCount?: number;
  rpmPointsCount?: number;
  traceTypes?: string[];
}

// Icon mapping for each analysis type
const iconMap: Record<string, IconComponent> = {
  performance: TrendingUp,
  traces: Activity,
  pvDiagrams: LineChart,
  noise: Volume2,
  turbo: Fan,
  configuration: History,
};

export default function AnalysisTypeCard({
  id,
  title,
  description,
  href,
  available,
  calculationsCount,
  rpmPointsCount,
  traceTypes
}: AnalysisTypeCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[id] || TrendingUp;

  const handleClick = () => {
    if (available) {
      navigate(href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter or Space opens the card
    if (available && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate(href);
    }
  };

  // Build status message based on analysis type
  const getStatusMessage = () => {
    if (!available) {
      return 'Not available';
    }

    if (id === 'performance' && calculationsCount !== undefined) {
      return `${calculationsCount} calculation${calculationsCount !== 1 ? 's' : ''} ready`;
    }

    if (id === 'traces' && rpmPointsCount !== undefined) {
      return `${rpmPointsCount} RPM points`;
    }

    if (id === 'configuration') {
      return 'View timeline';
    }

    return 'Available';
  };

  return (
    <Card
      className={`
        transition-all duration-300
        ${available
          ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
        }
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={available ? 0 : -1}
      role="button"
      aria-label={`${title}: ${getStatusMessage()}`}
      aria-disabled={!available}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${available ? 'text-primary' : 'text-muted-foreground'}`} />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {getStatusMessage()}
          </p>

          {/* Trace types badges */}
          {available && id === 'traces' && traceTypes && traceTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {traceTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!available}
          variant={available ? 'default' : 'secondary'}
        >
          {available ? `View Analysis →` : 'Coming in Phase 2'}
        </Button>
      </CardFooter>
    </Card>
  );
}
