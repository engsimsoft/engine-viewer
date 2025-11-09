import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalysisTypeCard from '@/components/project-overview/AnalysisTypeCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useProjectSummary } from '@/hooks/useProjectSummary';

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { summary, loading, error } = useProjectSummary(id!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorMessage
          message={error || 'Project not found'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const analysisTypes = [
    {
      id: 'performance',
      title: 'Performance & Efficiency',
      description: 'Power, Torque, MEP, BSFC, Efficiency',
      href: `/project/${id}/performance`,
      ...summary.availability.performance
    },
    {
      id: 'traces',
      title: 'Thermo & Gasdynamic Traces',
      description: 'Pressure, Temperature, Mach, Wave traces',
      href: `/project/${id}/traces`,
      ...summary.availability.traces
    },
    {
      id: 'pvDiagrams',
      title: 'PV-Diagrams',
      description: 'Pressure-Volume analysis',
      href: `/project/${id}/pv-diagrams`,
      ...summary.availability.pvDiagrams
    },
    {
      id: 'noise',
      title: 'Noise Spectrum',
      description: 'FFT Analysis',
      href: `/project/${id}/noise`,
      ...summary.availability.noise
    },
    {
      id: 'turbo',
      title: 'Turbocharger Map',
      description: 'Compressor efficiency',
      href: `/project/${id}/turbo`,
      ...summary.availability.turbo
    },
    {
      id: 'configuration',
      title: 'Configuration History',
      description: 'Track config changes',
      href: `/project/${id}/configuration`,
      ...summary.availability.configuration
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>

          <div>
            <h1 className="text-2xl font-bold">
              {summary.project.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {summary.project.specs.cylinders} Cyl • {summary.project.specs.engineType}
            </p>
          </div>
        </div>
      </header>

      {/* Analysis Types Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisTypes.map((type) => (
            <AnalysisTypeCard
              key={type.id}
              {...type}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
