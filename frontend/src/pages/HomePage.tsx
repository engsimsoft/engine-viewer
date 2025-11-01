import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import { MetadataDialog } from '@/components/projects/MetadataDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import type { ProjectInfo } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useProjects();

  // Диалог редактирования метаданных
  const [editingProject, setEditingProject] = useState<ProjectInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleEditProject = (project: ProjectInfo) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // Обновить список проектов после сохранения
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Engine Results Viewer</h1>
          <p className="text-muted-foreground">
            View and analyze internal combustion engine calculation results
          </p>
        </div>

        {/* Projects Count */}
        <div className="mb-6">
          <p className="text-lg">
            Projects found: <span className="font-semibold">{projects.length}</span>
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="text-6xl">📂</div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  No Projects Found
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Place .det files in the test-data/ folder to get started
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={handleOpenProject}
                onEdit={handleEditProject}
              />
            ))}
          </div>
        )}

        {/* Metadata Dialog */}
        <MetadataDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          project={editingProject}
          onSuccess={handleDialogSuccess}
        />
      </div>
    </div>
  );
}
