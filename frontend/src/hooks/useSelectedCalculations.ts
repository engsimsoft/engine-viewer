import { useState, useCallback } from 'react';

const MAX_CALCULATIONS = 5;

/**
 * Custom hook для управления выбором расчётов для сравнения
 *
 * Правила:
 * - Максимум 5 расчётов одновременно
 * - Можно выбирать/отменять выбор расчётов
 * - Если достигнут лимит, другие расчёты становятся недоступны для выбора
 *
 * @returns объект с выбранными расчётами и методами управления
 *
 * @example
 * ```tsx
 * const { selectedIds, toggleCalculation, isSelected, isMaxReached, canSelect, clearSelection } = useSelectedCalculations();
 *
 * // Проверить выбран ли расчёт
 * if (isSelected('$1')) { ... }
 *
 * // Переключить выбор расчёта
 * toggleCalculation('$1');
 *
 * // Проверить можно ли выбрать ещё расчёт
 * if (canSelect) { ... }
 *
 * // Очистить все выбранные расчёты
 * clearSelection();
 * ```
 */
export function useSelectedCalculations() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /**
   * Переключить выбор расчёта
   */
  const toggleCalculation = useCallback((calculationId: string) => {
    setSelectedIds((prev) => {
      const isCurrentlySelected = prev.includes(calculationId);

      if (isCurrentlySelected) {
        // Отменить выбор
        return prev.filter((id) => id !== calculationId);
      } else {
        // Добавить выбор (только если не достигнут лимит)
        if (prev.length >= MAX_CALCULATIONS) {
          console.warn(`Достигнут максимум выбранных расчётов (${MAX_CALCULATIONS})`);
          return prev;
        }
        return [...prev, calculationId];
      }
    });
  }, []);

  /**
   * Проверить выбран ли расчёт
   */
  const isSelected = useCallback(
    (calculationId: string): boolean => {
      return selectedIds.includes(calculationId);
    },
    [selectedIds]
  );

  /**
   * Проверить достигнут ли максимум выбранных расчётов
   */
  const isMaxReached = selectedIds.length >= MAX_CALCULATIONS;

  /**
   * Проверить можно ли выбрать ещё расчёты
   */
  const canSelect = selectedIds.length < MAX_CALCULATIONS;

  /**
   * Очистить все выбранные расчёты
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Установить конкретные расчёты (например при загрузке из localStorage)
   */
  const setSelection = useCallback((ids: string[]) => {
    if (ids.length > MAX_CALCULATIONS) {
      console.warn(`Слишком много расчётов (${ids.length}), будут выбраны первые ${MAX_CALCULATIONS}`);
      setSelectedIds(ids.slice(0, MAX_CALCULATIONS));
    } else {
      setSelectedIds(ids);
    }
  }, []);

  return {
    selectedIds,
    toggleCalculation,
    isSelected,
    isMaxReached,
    canSelect,
    clearSelection,
    setSelection,
    count: selectedIds.length,
    maxCount: MAX_CALCULATIONS,
  };
}
