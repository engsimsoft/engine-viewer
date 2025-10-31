/**
 * Calculation List Step - Comparison Modal Step 2
 *
 * Phase 3 - Section 3.3
 *
 * Second step of the 2-step Comparison Selection Modal.
 * Shows list of calculations from selected project.
 *
 * Features:
 * - Search calculations by name (case-insensitive)
 * - Single selection with radio button indicator
 * - RPM metadata display
 * - Back button to return to Step 1
 * - Add button (enabled only when calculation selected)
 * - Loading/error/empty states
 */

import { useState, useMemo } from 'react';
import { Search, X, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjectData } from '@/hooks/useProjectData';
import { useAppStore } from '@/stores/appStore';
import { formatRPMRange, calculateAverageStep } from '@/lib/rpmCalculator';
import { getNextColor } from '@/lib/colorManager';
import type { ProjectInfo } from '@/types';
import type { Calculation } from '@/types';
import type { CalculationReference } from '@/types/v2';
import { cn } from '@/lib/utils';

interface CalculationListStepProps {
  /** Selected project from Step 1 */
  selectedProject: ProjectInfo;
  /** Callback to go back to Step 1 */
  onBack: () => void;
  /** Callback when calculation is added */
  onAdd: () => void;
}

/**
 * Calculation List Step Component
 *
 * Step 2 of Comparison Selection Modal.
 * Displays calculations from selected project.
 *
 * @param selectedProject - Project selected in Step 1
 * @param onBack - Callback to return to project list
 * @param onAdd - Callback after successfully adding calculation
 */
export function CalculationListStep({
  selectedProject,
  onBack,
  onAdd,
}: CalculationListStepProps) {
  // Fetch project data (calculations)
  const { project, loading, error } = useProjectData(selectedProject.id);

  // Zustand store - comparison calculations and colors
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);
  const comparisonCalculations = useAppStore(
    (state) => state.comparisonCalculations
  );
  const addComparison = useAppStore((state) => state.addComparison);

  // Local state - search and selected calculation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalcId, setSelectedCalcId] = useState<string | null>(null);

  /**
   * Filter calculations by search query (case-insensitive)
   */
  const filteredCalculations = useMemo(() => {
    if (!project) return [];
    if (!searchQuery.trim()) return project.calculations;

    const query = searchQuery.toLowerCase();
    return project.calculations.filter(
      (calc) =>
        calc.id.toLowerCase().includes(query) ||
        calc.name.toLowerCase().includes(query)
    );
  }, [project, searchQuery]);

  /**
   * Get selected calculation object
   */
  const selectedCalculation = useMemo(() => {
    if (!project || !selectedCalcId) return null;
    return project.calculations.find((calc) => calc.id === selectedCalcId);
  }, [project, selectedCalcId]);

  /**
   * Handle Add Calculation button click
   * Builds CalculationReference and adds to comparison
   */
  const handleAdd = () => {
    if (!selectedCalculation || !project) return;

    // Calculate RPM metadata
    const rpmValues = selectedCalculation.dataPoints.map((p) => p.RPM);
    const rpmRange: [number, number] = [
      Math.min(...rpmValues),
      Math.max(...rpmValues),
    ];
    const avgStep = calculateAverageStep(selectedCalculation.dataPoints);

    // Get next available color
    // Used colors: primary color + comparison colors
    const usedColors = [
      primaryCalculation?.color,
      ...comparisonCalculations.map((c) => c.color),
    ].filter((c): c is string => c !== undefined);

    const nextColor = getNextColor(usedColors);

    // Build CalculationReference
    const calcRef: CalculationReference = {
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      calculationId: selectedCalculation.id,
      calculationName: selectedCalculation.name,
      color: nextColor,
      metadata: {
        rpmRange,
        avgStep,
        pointsCount: selectedCalculation.dataPoints.length,
        engineType: project.metadata.engineType,
        cylinders: project.metadata.numCylinders,
      },
    };

    // Add to comparison and close modal
    addComparison(calcRef);
    onAdd();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Step Header with Back Button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 -ml-1"
          aria-label="Back to project list"
        >
          <ChevronLeft className="h-4 w-4" />
          {selectedProject.name}
        </button>
        <h3 className="text-sm font-medium text-muted-foreground">
          Step 2 of 2
        </h3>
        <h2 className="text-lg font-semibold">Select Calculation</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search calculation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          <p>Loading calculations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">Error: {error}</p>
        </div>
      )}

      {/* Calculation List */}
      {!loading && !error && project && (
        <>
          <div className="max-h-[320px] overflow-y-auto -mx-6 px-6">
            {filteredCalculations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm">
                  {searchQuery
                    ? 'No calculations found matching your search'
                    : 'No calculations available'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCalculations.map((calc) => {
                  // Calculate RPM metadata for display
                  const rpmValues = calc.dataPoints.map((p) => p.RPM);
                  const rpmRange: [number, number] = [
                    Math.min(...rpmValues),
                    Math.max(...rpmValues),
                  ];
                  const avgStep = calculateAverageStep(calc.dataPoints);
                  const rpmInfo = formatRPMRange(rpmRange, avgStep);

                  // Check if this calculation is selected
                  const isSelected = selectedCalcId === calc.id;

                  return (
                    <button
                      key={calc.id}
                      onClick={() => setSelectedCalcId(calc.id)}
                      className={cn(
                        'w-full px-4 py-3 rounded-md border transition-all text-left',
                        'hover:bg-accent/50 hover:border-primary/50',
                        isSelected && 'bg-accent border-primary'
                      )}
                      aria-label={`Select ${calc.name}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-3">
                        {/* Selection Indicator - Radio Button Style */}
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all',
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-border'
                          )}
                          aria-hidden="true"
                        />

                        {/* Calculation Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {calc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rpmInfo}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Button */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleAdd}
              disabled={!selectedCalculation}
              className="w-full"
            >
              Add Calculation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default CalculationListStep;
