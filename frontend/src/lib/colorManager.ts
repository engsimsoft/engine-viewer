/**
 * Color Palette Manager
 *
 * Утилиты для управления цветами расчётов в визуализации.
 *
 * ВАЖНО:
 * - Primary calculation ВСЕГДА получает первый цвет (красный #ff6b6b)
 * - Comparison calculations получают цвета последовательно: cyan, blue, yellow, purple
 * - Максимум 5 расчётов одновременно: 1 primary + 4 comparisons
 */

import { CALCULATION_COLORS } from '../types/v2';
import type { CalculationReference } from '../types/v2';

/**
 * Возвращает следующий доступный цвет из палитры
 *
 * Выбирает первый цвет из CALCULATION_COLORS, который ещё не используется.
 * Если все цвета уже использованы (что не должно случиться при макс. 5 расчётов),
 * возвращает первый цвет из палитры.
 *
 * Алгоритм:
 * 1. Итерируем по CALCULATION_COLORS
 * 2. Для каждого цвета проверяем, есть ли он в usedColors
 * 3. Возвращаем первый неиспользованный цвет
 * 4. Если все использованы → возвращаем CALCULATION_COLORS[0] (fallback)
 *
 * Примеры:
 * - usedColors = ["#ff6b6b"] → вернёт "#4ecdc4" (cyan)
 * - usedColors = ["#ff6b6b", "#4ecdc4"] → вернёт "#45b7d1" (blue)
 * - usedColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#a29bfe"] → вернёт "#ff6b6b" (fallback)
 *
 * @param usedColors - Массив уже использованных цветов (hex строки)
 * @returns Следующий доступный цвет из палитры
 */
export function getNextColor(usedColors: string[]): string {
  // Iterate through palette and find first unused color
  for (const color of CALCULATION_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }

  // Fallback: if all colors are used (shouldn't happen with max 5 calculations)
  // Return the first color
  return CALCULATION_COLORS[0];
}

/**
 * Назначает цвета всем расчётам (primary + comparisons)
 *
 * ВАЖНО:
 * - Primary calculation ВСЕГДА получает CALCULATION_COLORS[0] (красный #ff6b6b)
 * - Comparisons получают цвета последовательно: colors[1], colors[2], colors[3], colors[4]
 * - Функция МУТИРУЕТ объекты CalculationReference, изменяя их поле color
 *
 * Правила назначения:
 * - Primary: CALCULATION_COLORS[0] = "#ff6b6b" (red)
 * - Comparison 1: CALCULATION_COLORS[1] = "#4ecdc4" (cyan)
 * - Comparison 2: CALCULATION_COLORS[2] = "#45b7d1" (blue)
 * - Comparison 3: CALCULATION_COLORS[3] = "#f9ca24" (yellow)
 * - Comparison 4: CALCULATION_COLORS[4] = "#a29bfe" (purple)
 *
 * Примеры использования:
 * ```typescript
 * const primary = { projectId: "vesta", calculationId: "$1", ... };
 * const comp1 = { projectId: "bmw", calculationId: "$5", ... };
 * const comp2 = { projectId: "vesta", calculationId: "$2", ... };
 *
 * assignColors(primary, [comp1, comp2]);
 *
 * // После выполнения:
 * // primary.color = "#ff6b6b" (red)
 * // comp1.color = "#4ecdc4" (cyan)
 * // comp2.color = "#45b7d1" (blue)
 * ```
 *
 * @param primary - Primary calculation (может быть null, если ещё не выбран)
 * @param comparisons - Массив comparison calculations (максимум 4)
 */
export function assignColors(
  primary: CalculationReference | null,
  comparisons: CalculationReference[]
): void {
  // Primary always gets the first color (red)
  if (primary) {
    primary.color = CALCULATION_COLORS[0];
  }

  // Comparisons get sequential colors starting from index 1
  comparisons.forEach((comparison, index) => {
    // index + 1 because:
    // - index 0 → CALCULATION_COLORS[1] (cyan)
    // - index 1 → CALCULATION_COLORS[2] (blue)
    // - index 2 → CALCULATION_COLORS[3] (yellow)
    // - index 3 → CALCULATION_COLORS[4] (purple)
    const colorIndex = index + 1;

    // Safety check: if somehow more than 4 comparisons, wrap around
    if (colorIndex < CALCULATION_COLORS.length) {
      comparison.color = CALCULATION_COLORS[colorIndex];
    } else {
      // Fallback: if more than 4 comparisons (shouldn't happen)
      // Wrap around to the beginning (skip index 0 which is for primary)
      const wrappedIndex = ((colorIndex - 1) % (CALCULATION_COLORS.length - 1)) + 1;
      comparison.color = CALCULATION_COLORS[wrappedIndex];
    }
  });
}

/**
 * Извлекает список использованных цветов из расчётов
 *
 * Вспомогательная функция для получения массива цветов, уже назначенных расчётам.
 * Используется совместно с getNextColor() для определения следующего доступного цвета.
 *
 * Примеры:
 * ```typescript
 * const primary = { color: "#ff6b6b", ... };
 * const comp1 = { color: "#4ecdc4", ... };
 * const comp2 = { color: "#45b7d1", ... };
 *
 * const used = getUsedColors(primary, [comp1, comp2]);
 * // used = ["#ff6b6b", "#4ecdc4", "#45b7d1"]
 *
 * const nextColor = getNextColor(used);
 * // nextColor = "#f9ca24" (yellow)
 * ```
 *
 * @param primary - Primary calculation (может быть null)
 * @param comparisons - Массив comparison calculations
 * @returns Массив использованных цветов (hex строки)
 */
export function getUsedColors(
  primary: CalculationReference | null,
  comparisons: CalculationReference[]
): string[] {
  const usedColors: string[] = [];

  if (primary && primary.color) {
    usedColors.push(primary.color);
  }

  for (const comparison of comparisons) {
    if (comparison.color) {
      usedColors.push(comparison.color);
    }
  }

  return usedColors;
}

/**
 * Проверяет, можно ли добавить ещё один comparison calculation
 *
 * Максимальное количество: 1 primary + 4 comparisons = 5 расчётов.
 * Функция проверяет, не достигнут ли лимит.
 *
 * @param comparisons - Текущий массив comparison calculations
 * @returns true если можно добавить ещё один comparison, false если достигнут лимит (4)
 */
export function canAddComparison(comparisons: CalculationReference[]): boolean {
  return comparisons.length < 4;
}

/**
 * Получает индекс цвета в палитре по hex значению
 *
 * Вспомогательная функция для отладки и тестирования.
 *
 * @param color - Цвет в hex формате (например "#ff6b6b")
 * @returns Индекс цвета в CALCULATION_COLORS или -1 если не найден
 */
export function getColorIndex(color: string): number {
  return CALCULATION_COLORS.indexOf(color as any);
}
