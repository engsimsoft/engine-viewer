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
import { ArrowLeft, Info, Layers } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAppStore } from '@/stores/appStore';
import { getParameterUnit } from '@/lib/unitsConversion';

/**
 * Group parameters by category
 */
function groupParametersByCategory() {
  const params = Object.values(PARAMETERS);

  return {
    performance: params.filter((p) => p.category === 'performance'),
    mep: params.filter((p) => p.category === 'mep'),
    temperature: params.filter((p) => p.category === 'temperature'),
    combustion: params.filter((p) => p.category === 'combustion'),
    efficiency: params.filter((p) => p.category === 'efficiency'),
    vibeModel: params.filter((p) => p.category === 'vibe-model'),
    quality: params.filter((p) => p.category === 'quality'),
  };
}

/**
 * ParameterRow Component
 *
 * Displays a single parameter with metadata
 */
interface ParameterRowProps {
  param: ParameterMetadata;
  units: 'si' | 'american' | 'hp';
}

function ParameterRow({ param, units }: ParameterRowProps) {
  // Build tooltip content: brief + description
  const tooltipContent = [param.brief, param.description]
    .filter(Boolean)
    .join('\n\n');

  // Get dynamic unit label based on current unit system
  const unitLabel = getParameterUnit(param.name, units);

  return (
    <div className="flex items-center gap-3 p-2.5 border rounded-lg hover:bg-accent/50 transition-colors">
      {/* Parameter Info */}
      <div className="flex-1 flex items-center gap-2">
        {/* Display Name */}
        <h3 className="text-base font-medium text-foreground">
          {param.displayName}
        </h3>

        {/* Technical Name (Monospace) */}
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {param.name}
        </code>

        {/* Unit Badge - Dynamic based on unit system */}
        {unitLabel && (
          <span className="text-xs text-muted-foreground">
            {unitLabel}
          </span>
        )}

        {/* Per-Cylinder Indicator */}
        {param.perCylinder && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-400">
            <Layers className="h-3 w-3" />
            <span>Per Cyl</span>
          </span>
        )}
      </div>

      {/* Info Icon with Tooltip */}
      {tooltipContent && (
        <Tooltip.Root delayDuration={300}>
          <Tooltip.Trigger asChild>
            <button
              className="inline-flex items-center justify-center rounded-full hover:bg-accent p-2 transition-colors flex-shrink-0"
              aria-label={`More information about ${param.displayName}`}
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={8}
              className="max-w-sm rounded-md bg-popover px-4 py-3 text-sm text-popover-foreground shadow-md border border-border z-50"
            >
              <p className="whitespace-pre-wrap">{tooltipContent}</p>
              <Tooltip.Arrow className="fill-popover" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const units = useAppStore((state) => state.units);
  const { performance, mep, temperature, combustion, efficiency, vibeModel, quality } = groupParametersByCategory();

  return (
    <Tooltip.Provider delayDuration={300}>
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
          {/* Performance Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-blue-500">🔷</span>
              Performance
              <span className="text-sm font-normal text-muted-foreground">
                ({performance.length})
              </span>
            </h2>
            <div className="space-y-2">
              {performance.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* MEP Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-purple-500">🔷</span>
              Mean Effective Pressure (MEP)
              <span className="text-sm font-normal text-muted-foreground">
                ({mep.length})
              </span>
            </h2>
            <div className="space-y-2">
              {mep.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* Temperature Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-500">🔷</span>
              Temperature
              <span className="text-sm font-normal text-muted-foreground">
                ({temperature.length})
              </span>
            </h2>
            <div className="space-y-2">
              {temperature.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* Combustion Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-orange-500">🔷</span>
              Combustion
              <span className="text-sm font-normal text-muted-foreground">
                ({combustion.length})
              </span>
            </h2>
            <div className="space-y-2">
              {combustion.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* Efficiency Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-500">🔷</span>
              Efficiency
              <span className="text-sm font-normal text-muted-foreground">
                ({efficiency.length})
              </span>
            </h2>
            <div className="space-y-2">
              {efficiency.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* Vibe Combustion Model Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-green-500">🔷</span>
              Vibe Combustion Model
              <span className="text-sm font-normal text-muted-foreground">
                ({vibeModel.length})
              </span>
            </h2>
            <div className="space-y-2">
              {vibeModel.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>

          {/* Calculation Quality Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-gray-500">🔷</span>
              Calculation Quality
              <span className="text-sm font-normal text-muted-foreground">
                ({quality.length})
              </span>
            </h2>
            <div className="space-y-2">
              {quality.map((param) => (
                <ParameterRow key={param.name} param={param} units={units} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
    </Tooltip.Provider>
  );
}
