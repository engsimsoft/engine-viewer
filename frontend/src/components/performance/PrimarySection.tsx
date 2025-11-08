/**
 * Primary Section Component - Primary Calculation Selector
 *
 * Phase 2 - Section 2.4
 *
 * Two states:
 * 1. Empty state (no calculation selected): Shows "Select calculation..." button
 * 2. Selected state (calculation selected): Shows calculation details + change button
 *
 * Features:
 * - Displays primary calculation metadata (RPM range, step, engine type, cylinders)
 * - Color indicator matches calculation.color (always red #ff6b6b for primary)
 * - Change button (↻ icon) opens Primary Selection Modal
 * - Integration with Zustand store
 */

import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { formatRPMRange } from '@/lib/rpmCalculator';

/**
 * Primary Section Component
 *
 * Manages primary calculation selection and display.
 * Displays empty state when no calculation is selected,
 * or calculation details when selected.
 *
 * @example
 * ```tsx
 * <PrimarySection />
 * ```
 */
export function PrimarySection() {
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);
  const togglePrimaryModal = useAppStore((state) => state.togglePrimaryModal);

  // ====================================================================
  // Empty State - No Calculation Selected
  // ====================================================================

  if (!primaryCalculation) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Primary Calculation
          </h3>
        </div>

        {/* Empty State Content */}
        <div className="text-center py-6 space-y-3">
          <div className="text-4xl">📊</div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Select Primary Calculation
            </p>
            <p className="text-xs text-muted-foreground">
              to start visualization
            </p>
          </div>
          <Button
            onClick={togglePrimaryModal}
            variant="default"
            className="mt-2"
          >
            Select Calculation
          </Button>
        </div>
      </div>
    );
  }

  // ====================================================================
  // Selected State - Calculation Selected
  // ====================================================================

  // Extract metadata
  const { rpmRange, avgStep, engineType, cylinders } =
    primaryCalculation.metadata;

  // Format RPM range and step
  const rpmInfo = formatRPMRange(rpmRange, avgStep);

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header Row: Title + Color Indicator + Change Button */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Icon + Title + Color Indicator */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Primary Calculation
          </h3>
          {/* Color Indicator */}
          <div
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: primaryCalculation.color }}
            title={`Color: ${primaryCalculation.color}`}
            aria-label={`Calculation color: ${primaryCalculation.color}`}
          />
        </div>

        {/* Right: Change Button */}
        <Button
          onClick={togglePrimaryModal}
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-accent"
          title="Change primary calculation"
          aria-label="Change primary calculation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Calculation Name */}
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground">
          {primaryCalculation.projectName} → {primaryCalculation.calculationName}
        </p>
      </div>

      {/* Metadata Line 1: RPM Range & Step */}
      <div className="text-xs text-muted-foreground mb-1">
        {rpmInfo}
      </div>

      {/* Metadata Line 2: Engine Type & Cylinders */}
      <div className="text-xs text-muted-foreground">
        {engineType} • {cylinders} cylinders
      </div>
    </div>
  );
}

export default PrimarySection;
