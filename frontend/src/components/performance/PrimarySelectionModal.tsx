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
import { Search, X, ArrowUpDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/stores/appStore';
import { useProjectData } from '@/hooks/useProjectData';
import { formatRPMRange, calculateAverageStep } from '@/lib/rpmCalculator';
import { CALCULATION_COLORS } from '@/types/v2';
import type { Calculation } from '@/types';
import type { CalculationReference } from '@/types/v2';
import { cn } from '@/lib/utils';
import { RenameCalculationDialog } from './RenameCalculationDialog';
import { DeleteCalculationDialog } from './DeleteCalculationDialog';
import { useCalculationMutations } from '@/hooks/useCalculationMutations';

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
  const { project, loading, error, refetch } = useProjectData(projectId);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest'); // Default: newest first

  // Dialogs state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);

  // Mutations hook
  const { renameCalculation, deleteCalculation } = useCalculationMutations(
    projectId,
    refetch
  );

  /**
   * Filter and sort calculations
   * - Filter by search query (searches in calculation id and name)
   * - Sort by order: newest first (default) or oldest first
   */
  const filteredCalculations = useMemo(() => {
    if (!project) return [];

    // Filter by search query
    let filtered = project.calculations;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = project.calculations.filter(
        (calc) =>
          calc.id.toLowerCase().includes(query) ||
          calc.name.toLowerCase().includes(query)
      );
    }

    // Sort by order
    // Calculations are stored in chronological order (oldest first)
    // So we reverse for newest first
    const sorted = [...filtered];
    if (sortOrder === 'newest') {
      sorted.reverse(); // Last calculation first
    }

    return sorted;
  }, [project, searchQuery, sortOrder]);

  /**
   * Handle rename action
   */
  const handleRename = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setRenameDialogOpen(true);
  };

  /**
   * Handle delete action
   */
  const handleDelete = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setDeleteDialogOpen(true);
  };

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
      projectName: project.name,
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
          <DialogDescription>
            {project ? `Project: ${project.fileName}` : 'Choose a calculation from the current project'}
          </DialogDescription>
        </DialogHeader>

        {/* Search Input + Sort Toggle */}
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
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

          {/* Sort Order Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            title={sortOrder === 'newest' ? 'Newest first (click for oldest first)' : 'Oldest first (click for newest first)'}
            aria-label={`Sort order: ${sortOrder === 'newest' ? 'newest first' : 'oldest first'}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
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
                {filteredCalculations
                  .filter((calc) => calc.dataPoints.length >= 2)
                  .map((calc) => {
                  // Calculate RPM metadata for display
                  const rpmValues = calc.dataPoints.map((p) => p.RPM);
                  const rpmRange: [number, number] = [
                    Math.min(...rpmValues),
                    Math.max(...rpmValues),
                  ];

                  let avgStep: number;
                  try {
                    avgStep = calculateAverageStep(calc.dataPoints);
                  } catch (error) {
                    console.error(`[PrimarySelectionModal] Error calculating RPM step for "${calc.name}":`, error);
                    return null; // Skip this calculation
                  }

                  const rpmInfo = formatRPMRange(rpmRange, avgStep);

                  // Check if this calculation is currently selected as primary
                  const isSelected =
                    primaryCalculation?.calculationId === calc.id;

                  return (
                    <div
                      key={calc.id}
                      className={cn(
                        'w-full px-4 py-3 rounded-md border transition-all',
                        'hover:bg-accent/50 hover:border-primary/50',
                        isSelected && 'bg-accent border-primary'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Selection Indicator - Filled/Empty Circle */}
                        <button
                          onClick={() => handleSelect(calc)}
                          className="flex-shrink-0"
                          aria-label={`Select ${calc.name}`}
                          aria-pressed={isSelected}
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 transition-all',
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-border'
                            )}
                            aria-hidden="true"
                          />
                        </button>

                        {/* Calculation Info - Clickable */}
                        <button
                          onClick={() => handleSelect(calc)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className="font-medium text-sm truncate">
                            {calc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rpmInfo}
                          </p>
                        </button>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRename(calc)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(calc)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Dialogs for Rename/Delete */}
      {selectedCalculation && (
        <>
          <RenameCalculationDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            currentName={selectedCalculation.name}
            onRename={(newId) => renameCalculation(selectedCalculation.id, newId)}
          />

          <DeleteCalculationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            calculationName={selectedCalculation.name}
            onConfirm={() => deleteCalculation(selectedCalculation.id)}
          />
        </>
      )}
    </Dialog>
  );
}

export default PrimarySelectionModal;
