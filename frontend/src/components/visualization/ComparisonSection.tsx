/**
 * Comparison Section Component - Comparison Calculations Manager
 *
 * Phase 2 - Section 2.6
 *
 * Two states:
 * 1. Empty state (0 comparisons): Shows "+ Add Calculation" button
 * 2. Filled state (1-4 comparisons): Shows comparison cards with remove buttons
 *
 * Features:
 * - Display up to 4 comparison calculations (MAX_COMPARISONS = 4)
 * - Each card shows: color indicator, project name, calculation name, RPM info
 * - Remove button on each card
 * - Add button with remaining slots counter "(X more)"
 * - Counter in header "(X/4)"
 * - Integration with Zustand store
 */

import { Scale, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { formatRPMRange } from '@/lib/rpmCalculator';
import { MAX_COMPARISONS } from '@/types/v2';
import { toast } from 'sonner';

/**
 * Comparison Section Component
 *
 * Manages comparison calculations (up to 4).
 * Displays empty state when no comparisons, or comparison cards when added.
 *
 * Connected to Zustand store - no props needed.
 *
 * @example
 * ```tsx
 * <ComparisonSection />
 * ```
 */
export function ComparisonSection() {
  const comparisonCalculations = useAppStore(
    (state) => state.comparisonCalculations
  );
  const removeComparison = useAppStore((state) => state.removeComparison);
  const toggleComparisonModal = useAppStore(
    (state) => state.toggleComparisonModal
  );

  // Calculate remaining slots
  const count = comparisonCalculations.length;
  const remaining = MAX_COMPARISONS - count;
  const isFull = count >= MAX_COMPARISONS;

  /**
   * Handle Add Calculation button click
   * Shows toast if max comparisons reached, otherwise opens modal
   */
  const handleAddClick = () => {
    if (isFull) {
      toast.info('Maximum comparisons reached', {
        description: 'You can compare up to 4 calculations (1 primary + 4 comparisons)',
      });
      return;
    }
    toggleComparisonModal();
  };

  // ====================================================================
  // Empty State - No Comparisons
  // ====================================================================

  if (count === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Compare With
          </h3>
          <span className="text-xs text-muted-foreground">(0/{MAX_COMPARISONS})</span>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAddClick}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Calculation
        </Button>
      </div>
    );
  }

  // ====================================================================
  // Filled State - Has Comparisons
  // ====================================================================

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header with Counter */}
      <div className="flex items-center gap-2 mb-3">
        <Scale className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Compare With</h3>
        <span className="text-xs text-muted-foreground">
          ({count}/{MAX_COMPARISONS})
        </span>
      </div>

      {/* Comparison Cards */}
      <div className="flex flex-col gap-2 mb-2">
        {comparisonCalculations.map((calc, index) => {
          // Format RPM info
          const rpmInfo = formatRPMRange(
            calc.metadata.rpmRange,
            calc.metadata.avgStep
          );

          return (
            <div
              key={`${calc.projectId}-${calc.calculationId}-${index}`}
              className="p-3 bg-background rounded-md border border-border hover:border-primary/30 transition-colors"
            >
              {/* Top Row: Color + Name + Remove Button */}
              <div className="flex items-start justify-between gap-2 mb-1">
                {/* Left: Color Indicator + Name */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Color Indicator */}
                  <div
                    className="w-3 h-3 rounded-full border border-border flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: calc.color }}
                    title={`Color: ${calc.color}`}
                    aria-label={`Calculation color: ${calc.color}`}
                  />

                  {/* Project & Calculation Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {calc.projectName} → {calc.calculationName}
                    </p>
                  </div>
                </div>

                {/* Right: Remove Button */}
                <Button
                  onClick={() => removeComparison(index)}
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  title="Remove calculation"
                  aria-label={`Remove ${calc.calculationName} from comparison`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Bottom Row: RPM Info */}
              <div className="text-xs text-muted-foreground pl-5">
                {rpmInfo}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Button (show if not full) */}
      {!isFull && (
        <Button
          onClick={handleAddClick}
          variant="outline"
          className="w-full justify-center gap-2 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Calculation {remaining > 0 && `(${remaining} more)`}
        </Button>
      )}
    </div>
  );
}

export default ComparisonSection;
