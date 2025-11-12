/**
 * DiagramTypeTabs Component
 *
 * Tab selector for PV-Diagram visualization types:
 * - P-V Diagram (Normal): Linear axes, classic thermodynamic diagram
 * - Log P-V: Logarithmic axes for polytropic process analysis
 * - P-α: Pressure vs Crank Angle (0-720°) with TDC/BDC markers
 *
 * Pattern: shadcn/ui Tabs component
 * Style: Professional engineering interface, WCAG 2.1 AA
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/stores/appStore';
import type { DiagramType } from '@/stores/slices/pvDiagramsSlice';

/**
 * DiagramTypeTabs Component
 *
 * Allows user to switch between 3 diagram visualization types.
 * Synced with Zustand store (selectedDiagramType).
 *
 * @example
 * ```tsx
 * <DiagramTypeTabs />
 * ```
 */
export function DiagramTypeTabs() {
  const selectedDiagramType = useAppStore((state) => state.selectedDiagramType);
  const setSelectedDiagramType = useAppStore((state) => state.setSelectedDiagramType);
  const showPumpingLosses = useAppStore((state) => state.showPumpingLosses);
  const setShowPumpingLosses = useAppStore((state) => state.setShowPumpingLosses);
  const showCombustionTiming = useAppStore((state) => state.showCombustionTiming); // v3.2.0
  const setShowCombustionTiming = useAppStore((state) => state.setShowCombustionTiming); // v3.2.0
  const showWorkPhases = useAppStore((state) => state.showWorkPhases); // v3.3.0
  const setShowWorkPhases = useAppStore((state) => state.setShowWorkPhases); // v3.3.0
  const selectedRPMs = useAppStore((state) => state.selectedRPMs); // v3.2.0: check single RPM mode

  const handleValueChange = (value: string) => {
    setSelectedDiagramType(value as DiagramType);
  };

  const handleTogglePumpingLosses = () => {
    setShowPumpingLosses(!showPumpingLosses);
  };

  const handleToggleCombustionTiming = () => {
    setShowCombustionTiming(!showCombustionTiming);
  };

  const handleToggleWorkPhases = () => {
    setShowWorkPhases(!showWorkPhases);
  };

  return (
    <div className="space-y-3">
      {/* Header with toggle buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          DIAGRAM TYPE
        </h2>
        <div className="flex gap-2">
          {/* Pumping Losses button (P-V diagram only) */}
          {selectedDiagramType === 'pv' && (
            <button
              onClick={handleTogglePumpingLosses}
              className={`
                text-xs px-2 py-0.5 rounded border transition-colors
                ${showPumpingLosses
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'}
              `}
              title="Zoom to pumping losses (0-2 bar range)"
            >
              Pumping Losses
            </button>
          )}
          {/* Combustion Timing button (P-α diagram, single RPM only) v3.2.0 */}
          {selectedDiagramType === 'p-alpha' && selectedRPMs.length === 1 && (
            <button
              onClick={handleToggleCombustionTiming}
              className={`
                text-xs px-2 py-0.5 rounded border transition-colors
                ${showCombustionTiming
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'}
              `}
              title="Show combustion timing markers (ignition, delay, burn duration)"
            >
              Combustion Timing
            </button>
          )}
          {/* Work Phases button (P-α diagram only, single RPM) v3.3.0 */}
          {selectedDiagramType === 'p-alpha' && selectedRPMs.length === 1 && (
            <button
              onClick={handleToggleWorkPhases}
              className={`
                text-xs px-2 py-0.5 rounded border transition-colors
                ${showWorkPhases
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'}
              `}
              title="Show work phases (Negative Work compression, Positive Work expansion)"
            >
              Work Phases
            </button>
          )}
        </div>
      </div>

      {/* Diagram Type Tabs */}
      <Tabs value={selectedDiagramType} onValueChange={handleValueChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pv" className="text-xs">
            P-V
          </TabsTrigger>
          <TabsTrigger value="log-pv" className="text-xs">
            Log P-V
          </TabsTrigger>
          <TabsTrigger value="p-alpha" className="text-xs">
            P-α
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
