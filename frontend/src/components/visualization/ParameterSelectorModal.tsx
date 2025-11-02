/**
 * Parameter Selector Modal Component
 *
 * ChartPreset4 - Phase 2
 *
 * Simple modal for selecting parameters for Custom Chart.
 *
 * Features:
 * - Search bar with real-time filtering
 * - Parameter grid with cards
 * - Per-cylinder selection for array parameters (Phase 3)
 * - Smooth animations and transitions
 *
 * Connected to Zustand store - no props needed.
 *
 * @example
 * ```tsx
 * <ParameterSelectorModal />
 * ```
 */

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { PARAMETERS } from '@/config/parameters';
import { getParameterUnit } from '@/lib/unitsConversion';
import { cn } from '@/lib/utils';

/**
 * Parameter Selector Modal Component
 *
 * Modal dialog for selecting parameters for Custom Chart (Preset 4).
 * Opens when user clicks "Select Parameters" button in ChartPreset4.
 */
export function ParameterSelectorModal() {
  // Zustand store
  const isOpen = useAppStore((state) => state.isParameterSelectorOpen);
  const toggleModal = useAppStore((state) => state.toggleParameterSelector);
  const selectedParams = useAppStore((state) => state.selectedCustomParams);
  const toggleParameter = useAppStore((state) => state.toggleParameter);
  const units = useAppStore((state) => state.units);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Get available parameters (chartable, not vibe-model/quality/RPM)
   * RPM is excluded because it's always used as X-axis
   */
  const availableParameters = useMemo(() => {
    return Object.values(PARAMETERS)
      .filter(p => p.chartable)
      .filter(p => !['vibe-model', 'quality'].includes(p.category))
      .filter(p => p.name !== 'RPM') // Exclude RPM (always X-axis)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  /**
   * Filter parameters by search query
   */
  const filteredParameters = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableParameters;
    }

    const query = searchQuery.toLowerCase();
    return availableParameters.filter(
      (param) =>
        param.name.toLowerCase().includes(query) ||
        param.displayName.toLowerCase().includes(query)
    );
  }, [availableParameters, searchQuery]);

  /**
   * Check if parameter is selected
   */
  const isParameterSelected = (paramId: string) => {
    return selectedParams.some(p => p.id === paramId);
  };

  /**
   * Handle parameter toggle
   */
  const handleToggleParameter = (paramId: string) => {
    toggleParameter(paramId);
  };

  /**
   * Close modal
   */
  const handleClose = () => {
    setSearchQuery('');
    toggleModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Parameters</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-1 transition-colors"
              aria-label="Clear search"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Parameter Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredParameters.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No parameters found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">
              {filteredParameters.map((param) => {
                const isSelected = isParameterSelected(param.name);
                const unit = getParameterUnit(param.name, units);

                return (
                  <button
                    key={param.name}
                    onClick={() => handleToggleParameter(param.name)}
                    className={cn(
                      'flex flex-col items-start gap-1.5 p-4 rounded-lg border-2 transition-all text-left',
                      'hover:border-primary/50 hover:shadow-sm',
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border'
                    )}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <span className="font-semibold text-sm">{param.name}</span>
                      {param.perCylinder && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded">
                          AVG
                        </span>
                      )}
                    </div>
                    {unit && (
                      <span className="text-xs text-muted-foreground">
                        {unit}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedParams.length} parameter{selectedParams.length !== 1 ? 's' : ''} selected
          </p>
          <Button onClick={handleClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
