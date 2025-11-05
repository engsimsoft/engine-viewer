import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, Archive, Calendar, Cpu, User, Edit } from 'lucide-react';
import type { ProjectInfo } from '@/types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import EngineBadge from './EngineBadge';
import { Separator } from '@/components/ui/separator';

interface ProjectCardProps {
  project: ProjectInfo;
  onOpen: (id: string) => void;
  onEdit?: (project: ProjectInfo) => void;
}

// Status configuration with icons and colors
const statusConfig = {
  active: {
    label: 'Active',
    icon: Wrench,
    color: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-600 text-white hover:bg-green-700',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: 'bg-gray-600 text-white hover:bg-gray-700',
  },
};

export default function ProjectCard({ project, onOpen, onEdit }: ProjectCardProps) {
  const metadata = project.metadata;

  // Get displayName from metadata (metadata v1.0)
  const displayName = metadata?.displayName || project.displayName;

  // Client (always show - either name or "(No client)")
  const clientName = metadata?.manual?.client || null;

  // Status (from metadata.manual.status or legacy project.status)
  const status = metadata?.manual?.status || project.status || 'active';
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleCardClick = () => {
    onOpen(project.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open project ${project.name}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Display Name (large, bold) - fallback to name */}
            <CardTitle className="text-xl truncate">
              {displayName || project.name}
            </CardTitle>

            {/* ID (small, muted) - shown below display name */}
            {displayName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                ID: {project.id}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge className={`gap-1 shrink-0 ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Separator after ID */}
        {displayName && <Separator className="mt-3" />}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Calculations count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cpu className="w-4 h-4" />
          <span>{project.calculationsCount} calculations</span>
        </div>

        {/* Engine specification badges (ONLY: Type, Cylinders, Intake) */}
        <EngineBadge
          type={metadata?.auto?.type}
          cylinders={metadata?.auto?.cylinders || project.numCylinders}
          intake={metadata?.auto?.intakeSystem}
        />

        {/* Client (ALWAYS show) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          {clientName ? (
            <span>{clientName}</span>
          ) : (
            <span className="italic">(No client)</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>
            Modified: {format(new Date(project.lastModified), 'dd MMM yyyy', { locale: enUS })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {onEdit && (
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            aria-label="Edit project info"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project.id);
          }}
        >
          Open Project
        </Button>
      </CardFooter>
    </Card>
  );
}
