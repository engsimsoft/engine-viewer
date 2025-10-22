import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, loading, error, refetch } = useProjects();

  const handleOpenProject = (id: string) => {
    navigate(`/project/${id}`);
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
            Просмотр и анализ результатов расчётов двигателей внутреннего сгорания
          </p>
        </div>

        {/* Projects Count */}
        <div className="mb-6">
          <p className="text-lg">
            Найдено проектов: <span className="font-semibold">{projects.length}</span>
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Проекты не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={handleOpenProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
