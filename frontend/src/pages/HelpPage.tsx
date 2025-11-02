/**
 * HelpPage Component - Parameters Documentation
 *
 * Displays comprehensive documentation for all 29 engine parameters.
 *
 * Features:
 * - Back button to return to visualization
 * - Search functionality for parameters
 * - Grouped by category (global, mep, per-cylinder, vibe-model)
 * - Tooltips with full descriptions
 * - Dynamic units display (SI/American/HP)
 *
 * Related: docs/tasks/performance-efficiency-header-roadmap.md (Phase 2-7)
 */

import { useNavigate } from 'react-router-dom';
import { PARAMETERS } from '@/config/parameters';
import type { ParameterMetadata } from '@/config/parameters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';

/**
 * Group parameters by category
 */
function groupParametersByCategory() {
  const params = Object.values(PARAMETERS);

  return {
    global: params.filter((p) => p.category === 'global'),
    mep: params.filter((p) => p.category === 'mep'),
    perCylinder: params.filter((p) => p.category === 'per-cylinder'),
    vibeModel: params.filter((p) => p.category === 'vibe-model'),
  };
}

/**
 * ParameterRow Component
 *
 * Displays a single parameter with metadata
 */
interface ParameterRowProps {
  param: ParameterMetadata;
}

function ParameterRow({ param }: ParameterRowProps) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      {/* Left: Parameter Info */}
      <div className="flex-1 space-y-1">
        {/* Display Name (Bold) */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {param.displayName}
          </h3>
          {/* Info Icon (Placeholder for Phase 4 tooltips) */}
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Technical Name (Monospace) */}
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            {param.name}
          </code>
          {/* Unit Badge */}
          {param.unit && (
            <span className="text-sm text-muted-foreground">
              {param.unit}
            </span>
          )}
        </div>

        {/* Brief Description */}
        {param.brief && (
          <p className="text-sm text-muted-foreground mt-2">
            {param.brief}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const { global, mep, perCylinder, vibeModel } = groupParametersByCategory();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Visualization</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Parameters Reference</h1>
          <p className="text-muted-foreground mt-2">
            Complete guide to all engine parameters
          </p>
        </div>

        {/* Parameters Sections */}
        <div className="space-y-8">
          {/* Global Parameters Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-500">🔷</span>
              Global Parameters
              <span className="text-sm font-normal text-muted-foreground">
                ({global.length})
              </span>
            </h2>
            <div className="space-y-3">
              {global.map((param) => (
                <ParameterRow key={param.name} param={param} />
              ))}
            </div>
          </section>

          {/* MEP Parameters Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-purple-500">🔷</span>
              Mean Effective Pressure (MEP)
              <span className="text-sm font-normal text-muted-foreground">
                ({mep.length})
              </span>
            </h2>
            <div className="space-y-3">
              {mep.map((param) => (
                <ParameterRow key={param.name} param={param} />
              ))}
            </div>
          </section>

          {/* Per-Cylinder Parameters Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-orange-500">🔷</span>
              Per-Cylinder Parameters
              <span className="text-sm font-normal text-muted-foreground">
                ({perCylinder.length})
              </span>
            </h2>
            <div className="space-y-3">
              {perCylinder.map((param) => (
                <ParameterRow key={param.name} param={param} />
              ))}
            </div>
          </section>

          {/* Vibe Combustion Model Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-500">🔷</span>
              Vibe Combustion Model
              <span className="text-sm font-normal text-muted-foreground">
                ({vibeModel.length})
              </span>
            </h2>
            <div className="space-y-3">
              {vibeModel.map((param) => (
                <ParameterRow key={param.name} param={param} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
