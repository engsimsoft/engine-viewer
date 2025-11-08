/**
 * Parameter Selector Modal Component
 *
 * ChartPreset4 - Phase 2-3
 *
 * Simple modal for selecting parameters for Custom Chart.
 *
 * Features:
 * - Search bar with real-time filtering
 * - Parameter grid with cards
 * - Per-cylinder selection dropdown (Avg/Cyl1-4) for array parameters
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
import { Search, X, ChevronDown } from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const setCylinderSelection = useAppStore((state) => state.setCylinderSelection);
  const units = useAppStore((state) => state.units);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Get available parameters (chartable, not RPM)
   * RPM is excluded because it's always used as X-axis
   */
  const availableParameters = useMemo(() => {
    return Object.values(PARAMETERS)
      .filter(p => p.chartable)
      .filter(p => p.name !== 'RPM') // Exclude RPM (always X-axis)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  /**
   * Group parameters by category
   */
  const groupedParameters = useMemo(() => {
    return {
      performance: availableParameters.filter(p => p.category === 'performance'),
      mep: availableParameters.filter(p => p.category === 'mep'),
      temperature: availableParameters.filter(p => p.category === 'temperature'),
      combustion: availableParameters.filter(p => p.category === 'combustion'),
      efficiency: availableParameters.filter(p => p.category === 'efficiency'),
      vibeModel: availableParameters.filter(p => p.category === 'vibe-model'),
      quality: availableParameters.filter(p => p.category === 'quality'),
    };
  }, [availableParameters]);

  /**
   * Filter parameters by search query
   */
  const filteredParameters = useMemo(() => {
    if (!searchQuery.trim()) {
      return null; // Return null to indicate we should use grouped view
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
   * Get cylinder selection for a parameter
   */
  const getCylinderSelection = (paramId: string): 'avg' | number | null => {
    const selectedParam = selectedParams.find(p => p.id === paramId);
    return selectedParam?.cylinder ?? null;
  };

  /**
   * Get cylinder selection label
   */
  const getCylinderLabel = (cylinder: 'avg' | number | null): string => {
    if (cylinder === 'avg' || cylinder === null) return 'Avg';
    return `Cyl${cylinder}`;
  };

  /**
   * Handle parameter toggle
   */
  const handleToggleParameter = (paramId: string) => {
    toggleParameter(paramId);
  };

  /**
   * Handle cylinder selection change
   */
  const handleCylinderChange = (paramId: string, cylinder: 'avg' | number) => {
    setCylinderSelection(paramId, cylinder);
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
          <DialogDescription>
            Choose parameters to visualize on the custom chart
          </DialogDescription>
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
          {filteredParameters !== null ? (
            // Search mode - flat filtered grid
            filteredParameters.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                No parameters found
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">
                {filteredParameters.map((param) => {
                  const isSelected = isParameterSelected(param.name);
                  const unit = getParameterUnit(param.name, units);
                  const cylinderSelection = getCylinderSelection(param.name);

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
                          <>
                            {/* Show dropdown only for SELECTED per-cylinder parameters */}
                            {isSelected ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                      'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                      'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                    )}
                                  >
                                    {getCylinderLabel(cylinderSelection)}
                                    <ChevronDown className="size-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-40 p-1">
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCylinderChange(param.name, 'avg');
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                        (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                      )}
                                    >
                                      Averaged
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCylinderChange(param.name, 1);
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                        cylinderSelection === 1 && 'bg-primary/10'
                                      )}
                                    >
                                      Cylinder 1
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCylinderChange(param.name, 2);
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                        cylinderSelection === 2 && 'bg-primary/10'
                                      )}
                                    >
                                      Cylinder 2
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCylinderChange(param.name, 3);
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                        cylinderSelection === 3 && 'bg-primary/10'
                                      )}
                                    >
                                      Cylinder 3
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCylinderChange(param.name, 4);
                                      }}
                                      className={cn(
                                        'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                        cylinderSelection === 4 && 'bg-primary/10'
                                      )}
                                    >
                                      Cylinder 4
                                    </button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                AVG
                              </span>
                            )}
                          </>
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
            )
          ) : (
            // Grouped mode - category sections
            <div className="space-y-6 p-1">
              {/* Performance Section */}
              {groupedParameters.performance.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-600">
                    Performance
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.performance.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.performance.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* MEP Section */}
              {groupedParameters.mep.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-purple-600">
                    Mean Effective Pressure (MEP)
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.mep.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.mep.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* Temperature Section */}
              {groupedParameters.temperature.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
                    Temperature
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.temperature.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.temperature.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* Combustion Section */}
              {groupedParameters.combustion.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-orange-600">
                    Combustion
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.combustion.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.combustion.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* Efficiency Section */}
              {groupedParameters.efficiency.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-cyan-600">
                    Efficiency
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.efficiency.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.efficiency.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* Vibe Combustion Model Section */}
              {groupedParameters.vibeModel.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-600">
                    Vibe Combustion Model
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.vibeModel.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.vibeModel.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}

              {/* Calculation Quality Section */}
              {groupedParameters.quality.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-600">
                    Calculation Quality
                    <span className="text-xs font-normal text-muted-foreground">
                      ({groupedParameters.quality.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedParameters.quality.map((param) => {
                      const isSelected = isParameterSelected(param.name);
                      const unit = getParameterUnit(param.name, units);
                      const cylinderSelection = getCylinderSelection(param.name);

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
                              <>
                                {isSelected ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
                                          'bg-primary/20 hover:bg-primary/30 rounded transition-colors'
                                        )}
                                      >
                                        {getCylinderLabel(cylinderSelection)}
                                        <ChevronDown className="size-4" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-40 p-1">
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 'avg');
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            (cylinderSelection === 'avg' || cylinderSelection === null) && 'bg-primary/10'
                                          )}
                                        >
                                          Averaged
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 1);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 1 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 1
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 2);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 2 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 2
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 3);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 3 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 3
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCylinderChange(param.name, 4);
                                          }}
                                          className={cn(
                                            'px-3 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors',
                                            cylinderSelection === 4 && 'bg-primary/10'
                                          )}
                                        >
                                          Cylinder 4
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                                    AVG
                                  </span>
                                )}
                              </>
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
                </section>
              )}
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
