/**
 * Primary Selection Modal Component
 *
 * Phase 3 - Section 3.1
 *
 * Modal for selecting Primary Calculation from current project.
 *
 * Features:
 * - Search functionality (by calculation name)
 * - Scrollable calculation list (max-height 400px)
 * - RPM metadata display (range + avg step)
 * - Selection indicator (filled/empty circle)
 * - Smooth animations (fade in/out)
 *
 * Connected to Zustand store - no props needed.
 *
 * @example
 * ```tsx
 * <PrimarySelectionModal />
 * ```
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/appStore';
import { useProjectData } from '@/hooks/useProjectData';
import { formatRPMRange, calculateAverageStep } from '@/lib/rpmCalculator';
import { CALCULATION_COLORS } from '@/types/v2';
import type { Calculation } from '@/types';
import type { CalculationReference } from '@/types/v2';
import { cn } from '@/lib/utils';

/**
 * Primary Selection Modal Component
 *
 * Modal dialog for selecting the primary calculation from the current project.
 * Opens when user clicks "Select calculation..." button in Primary Section.
 */
export function PrimarySelectionModal() {
  // Get projectId from URL
  const { id: projectId } = useParams<{ id: string }>();

  // Zustand store - modal state and primary calculation
  const isPrimaryModalOpen = useAppStore((state) => state.isPrimaryModalOpen);
  const togglePrimaryModal = useAppStore((state) => state.togglePrimaryModal);
  const setPrimaryCalculation = useAppStore(
    (state) => state.setPrimaryCalculation
  );
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);

  // Project data - fetch from API
  const { project, loading, error } = useProjectData(projectId);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filter calculations by search query
   * Searches in both calculation id ($1, $2...) and name
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
   * Handle calculation selection
   * Creates CalculationReference object and sets as primary
   */
  const handleSelect = (calculation: Calculation) => {
    if (!project || !projectId) return;

    // Calculate RPM metadata
    const rpmValues = calculation.dataPoints.map((p) => p.RPM);
    const rpmRange: [number, number] = [
      Math.min(...rpmValues),
      Math.max(...rpmValues),
    ];
    const avgStep = calculateAverageStep(calculation.dataPoints);

    // Build CalculationReference
    const calcRef: CalculationReference = {
      projectId: projectId,
      projectName: project.fileName,
      calculationId: calculation.id,
      calculationName: calculation.name,
      color: CALCULATION_COLORS[0], // Primary always red (index 0)
      metadata: {
        rpmRange,
        avgStep,
        pointsCount: calculation.dataPoints.length,
        engineType: project.metadata.engineType,
        cylinders: project.metadata.numCylinders,
      },
    };

    // Set as primary and close modal
    setPrimaryCalculation(calcRef);
    togglePrimaryModal();
    setSearchQuery(''); // Reset search on close
  };

  return (
    <Dialog open={isPrimaryModalOpen} onOpenChange={togglePrimaryModal}>
      <DialogContent className="sm:max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Select Primary Calculation</DialogTitle>
          {project && (
            <p className="text-sm text-muted-foreground">
              Project: {project.fileName}
            </p>
          )}
        </DialogHeader>

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
          <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
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

                  // Check if this calculation is currently selected as primary
                  const isSelected =
                    primaryCalculation?.calculationId === calc.id;

                  return (
                    <button
                      key={calc.id}
                      onClick={() => handleSelect(calc)}
                      className={cn(
                        'w-full px-4 py-3 rounded-md border transition-all text-left',
                        'hover:bg-accent/50 hover:border-primary/50',
                        isSelected && 'bg-accent border-primary'
                      )}
                      aria-label={`Select ${calc.name}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-3">
                        {/* Selection Indicator - Filled/Empty Circle */}
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
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PrimarySelectionModal;
