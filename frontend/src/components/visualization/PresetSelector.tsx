import { cn } from '@/lib/utils';

export type ChartPresetType = 'preset1' | 'preset2' | 'preset3' | 'preset4';

interface PresetSelectorProps {
  activePreset: ChartPresetType;
  onPresetChange: (preset: ChartPresetType) => void;
}

interface PresetOption {
  id: ChartPresetType;
  label: string;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'preset1',
    label: 'Пресет 1',
    description: 'Мощность и момент',
  },
  {
    id: 'preset2',
    label: 'Пресет 2',
    description: 'Давление в цилиндрах',
  },
  {
    id: 'preset3',
    label: 'Пресет 3',
    description: 'Температурный режим',
  },
  {
    id: 'preset4',
    label: 'Пресет 4',
    description: 'Кастомный график',
  },
];

/**
 * Селектор пресетов графиков
 *
 * Позволяет переключаться между 4 пресетами визуализации:
 * - Пресет 1: Мощность и момент (P-Av + Torque)
 * - Пресет 2: Давление в цилиндрах (PCylMax)
 * - Пресет 3: Температурный режим (TCylMax + TUbMax)
 * - Пресет 4: Кастомный график (выбор параметров)
 *
 * @example
 * ```tsx
 * <PresetSelector
 *   activePreset={activePreset}
 *   onPresetChange={setActivePreset}
 * />
 * ```
 */
export function PresetSelector({
  activePreset,
  onPresetChange,
}: PresetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="w-full mb-1">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Выберите пресет графиков
        </h3>
      </div>
      {PRESET_OPTIONS.map((preset) => {
        const isActive = activePreset === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onPresetChange(preset.id)}
            className={cn(
              'flex flex-col items-start px-4 py-3 rounded-md border-2 transition-all',
              'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
              'min-w-[160px]',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-background border-border hover:border-primary/50'
            )}
          >
            <span className="font-semibold text-sm">{preset.label}</span>
            <span
              className={cn(
                'text-xs mt-1',
                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
            >
              {preset.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
