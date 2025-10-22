import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle, Archive, Calendar, Cpu, FileText } from 'lucide-react';
import type { ProjectInfo } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ProjectCardProps {
  project: ProjectInfo;
  onOpen: (id: string) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const metadata = project.metadata;

  // Status icon and color mapping
  const statusConfig = {
    active: {
      icon: <Wrench className="w-4 h-4" />,
      label: 'В работе',
      color: 'bg-blue-500',
    },
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Завершён',
      color: 'bg-green-500',
    },
    archived: {
      icon: <Archive className="w-4 h-4" />,
      label: 'Архив',
      color: 'bg-gray-500',
    },
  };

  const status = metadata?.status || 'active';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
      style={{ borderLeftColor: metadata?.color || '#3b82f6' }}
      onClick={() => onOpen(project.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate">{project.name}</CardTitle>
            {metadata?.description && (
              <CardDescription className="mt-1">{metadata.description}</CardDescription>
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
        {metadata?.client && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Клиент: {metadata.client}</span>
          </div>
        )}

        {/* Engine info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span>{project.engineType}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span>{project.numCylinders} цил.</span>
          <span className="text-muted-foreground">•</span>
          <span>{project.calculationsCount} расчётов</span>
        </div>

        {/* Tags */}
        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {metadata.tags.map((tag) => (
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
            Изменён: {format(new Date(project.lastModified), 'dd MMM yyyy', { locale: ru })}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project.id);
          }}
        >
          Открыть проект
        </Button>
      </CardFooter>
    </Card>
  );
}
