import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Calculation } from '@/types';

// Цвета для расчётов (из config.yaml)
const CALCULATION_COLORS = [
  '#ff6b6b', // Красный
  '#4ecdc4', // Бирюзовый
  '#45b7d1', // Синий
  '#f9ca24', // Жёлтый
  '#a29bfe', // Фиолетовый
];

/**
 * Получить цвет для расчёта по индексу
 */
function getCalculationColor(index: number): string {
  return CALCULATION_COLORS[index % CALCULATION_COLORS.length];
}

interface CalculationSelectorProps {
  calculations: Calculation[];
  selectedIds: string[];
  onToggle: (calculationId: string) => void;
  isMaxReached: boolean;
  maxCount: number;
}

/**
 * Компонент для выбора расчётов для отображения на графиках
 *
 * Правила:
 * - Максимум 5 расчётов одновременно
 * - Каждый расчёт имеет свой цвет
 * - Если достигнут лимит, недоступные чекбоксы disabled
 *
 * @example
 * ```tsx
 * <CalculationSelector
 *   calculations={project.calculations}
 *   selectedIds={selectedIds}
 *   onToggle={toggleCalculation}
 *   isMaxReached={isMaxReached}
 *   maxCount={maxCount}
 * />
 * ```
 */
export function CalculationSelector({
  calculations,
  selectedIds,
  onToggle,
  isMaxReached,
  maxCount,
}: CalculationSelectorProps) {
  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Select Calculations
        </h3>
        <Badge variant="secondary">
          {selectedIds.length} / {maxCount}
        </Badge>
      </div>

      {/* Список расчётов */}
      <div className="space-y-2">
        {calculations.map((calculation, index) => {
          const selected = isSelected(calculation.id);
          const disabled = !selected && isMaxReached;
          const color = getCalculationColor(index);

          return (
            <div
              key={calculation.id}
              className={`
                flex items-center space-x-3 p-3 rounded-lg border
                transition-colors
                ${
                  selected
                    ? 'bg-accent border-accent-foreground/20'
                    : 'bg-card hover:bg-accent/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !disabled && onToggle(calculation.id)}
            >
              {/* Чекбокс */}
              <Checkbox
                id={`calc-${calculation.id}`}
                checked={selected}
                disabled={disabled}
                onCheckedChange={() => onToggle(calculation.id)}
                className="cursor-pointer"
              />

              {/* Цветной индикатор */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />

              {/* Label с названием расчёта */}
              <Label
                htmlFor={`calc-${calculation.id}`}
                className={`
                  flex-1 cursor-pointer select-none font-medium
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
              >
                {calculation.name}
              </Label>

              {/* Бейдж для выбранного расчёта */}
              {selected && (
                <Badge variant="default" className="ml-auto">
                  Selected
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Подсказка когда достигнут лимит */}
      {isMaxReached && (
        <p className="text-sm text-muted-foreground">
          Maximum calculations selected ({maxCount}). Deselect to add others.
        </p>
      )}

      {/* Подсказка когда ничего не выбрано */}
      {selectedIds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select calculations to display on chart
        </p>
      )}
    </div>
  );
}
