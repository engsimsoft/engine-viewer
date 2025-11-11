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

  const handleValueChange = (value: string) => {
    setSelectedDiagramType(value as DiagramType);
  };

  const handleTogglePumpingLosses = () => {
    setShowPumpingLosses(!showPumpingLosses);
  };

  return (
    <div className="space-y-3">
      {/* Header with Pumping Losses button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          DIAGRAM TYPE
        </h2>
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
