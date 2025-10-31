/**
 * Preset Selector Component - Chart Presets Selector
 *
 * Phase 2 - Section 2.5
 *
 * Updated version with:
 * - Connection to Zustand store (no props needed)
 * - English labels and descriptions
 * - Improved styling (2x2 grid layout)
 * - Active state with primary color
 */

import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

/**
 * Preset option definition
 */
interface PresetOption {
  id: 1 | 2 | 3 | 4;
  label: string;
  description: string;
}

/**
 * Chart preset options
 *
 * ВАЖНО: Названия параметров НЕ переводить! (P-Av, Torque, PCylMax, TCylMax, TUbMax)
 */
const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 1,
    label: 'Power & Torque',
    description: 'P-Av & Torque',
  },
  {
    id: 2,
    label: 'Pressure',
    description: 'PCylMax',
  },
  {
    id: 3,
    label: 'Temperature',
    description: 'TCylMax & TUbMax',
  },
  {
    id: 4,
    label: 'Custom',
    description: 'Custom Chart',
  },
];

/**
 * Preset Selector Component
 *
 * Allows switching between 4 chart visualization presets:
 * - Preset 1: Power & Torque (P-Av + Torque)
 * - Preset 2: Cylinder Pressure (PCylMax)
 * - Preset 3: Temperature (TCylMax + TUbMax)
 * - Preset 4: Custom Chart (user-selected parameters)
 *
 * Connected to Zustand store - no props needed.
 *
 * @example
 * ```tsx
 * <PresetSelector />
 * ```
 */
export function PresetSelector() {
  const selectedPreset = useAppStore((state) => state.selectedPreset);
  const setSelectedPreset = useAppStore((state) => state.setSelectedPreset);

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Chart Presets
        </h3>
      </div>

      {/* Presets Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_OPTIONS.map((preset) => {
          const isActive = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={cn(
                'flex flex-col items-start px-3 py-2.5 rounded-md border transition-all',
                'hover:shadow-sm active:scale-[0.98]',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background border-border hover:border-primary/50 hover:bg-accent/50'
              )}
              aria-label={`Select ${preset.label} preset`}
              aria-pressed={isActive}
            >
              <span className="font-semibold text-xs">{preset.label}</span>
              <span
                className={cn(
                  'text-xs mt-0.5',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PresetSelector;
