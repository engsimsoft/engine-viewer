import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle, Archive, Calendar, Cpu, FileText, Edit } from 'lucide-react';
import type { ProjectInfo } from '@/types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import EngineBadge from './EngineBadge';

interface ProjectCardProps {
  project: ProjectInfo;
  onOpen: (id: string) => void;
  onEdit?: (project: ProjectInfo) => void;
}

export default function ProjectCard({ project, onOpen, onEdit }: ProjectCardProps) {
  const metadata = project.metadata;

  // Status icon and color mapping
  const statusConfig = {
    active: {
      icon: <Wrench className="w-4 h-4" />,
      label: 'In Progress',
      color: 'bg-blue-500',
    },
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Completed',
      color: 'bg-green-500',
    },
    archived: {
      icon: <Archive className="w-4 h-4" />,
      label: 'Archived',
      color: 'bg-gray-500',
    },
  };

  const status = metadata?.manual?.status || 'active';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

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
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ borderLeftColor: metadata?.manual?.color || '#3b82f6' }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open project ${project.name}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate">{project.name}</CardTitle>
            {metadata?.manual?.description && (
              <CardDescription className="mt-1">{metadata.manual.description}</CardDescription>
            )}
          </div>
          <Badge
            className={`${config.color} text-white flex items-center gap-1 shrink-0`}
          >
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Metadata info */}
        {metadata?.manual?.client && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Client: {metadata.manual.client}</span>
          </div>
        )}

        {/* Engine specification badges */}
        <EngineBadge
          type={metadata?.auto?.type}
          cylinders={metadata?.auto?.cylinders || project.numCylinders}
          configuration={metadata?.auto?.configuration}
          intake={metadata?.auto?.intakeSystem}
          exhaust={metadata?.auto?.exhaustSystem}
        />

        {/* Engine info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4" />
            <span>{project.calculationsCount} calculations</span>
          </div>
        </div>

        {/* Tags */}
        {metadata?.manual?.tags && metadata.manual.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {metadata.manual.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
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
            aria-label={`Edit project ${project.name}`}
          >
            <Edit className="w-4 h-4" />
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
