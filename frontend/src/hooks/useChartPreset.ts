import { useState, useEffect } from 'react';
import type { ChartPresetType } from '@/components/visualization/PresetSelector';

const STORAGE_KEY = 'engine-viewer-chart-preset';

/**
 * Hook для управления выбором пресета графиков
 *
 * Сохраняет выбранный пресет в localStorage для сохранения между сеансами.
 * По умолчанию используется 'preset1' (Мощность и момент).
 *
 * @returns Кортеж [activePreset, setActivePreset]
 *
 * @example
 * ```tsx
 * function ProjectPage() {
 *   const [activePreset, setActivePreset] = useChartPreset();
 *
 *   return (
 *     <PresetSelector
 *       activePreset={activePreset}
 *       onPresetChange={setActivePreset}
 *     />
 *   );
 * }
 * ```
 */
export function useChartPreset(): [
  ChartPresetType,
  (preset: ChartPresetType) => void
] {
  // Загружаем сохранённый пресет из localStorage или используем preset1 по умолчанию
  const [activePreset, setActivePresetState] = useState<ChartPresetType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidPreset(saved)) {
        return saved as ChartPresetType;
      }
    } catch (error) {
      console.warn('Failed to load preset from localStorage:', error);
    }
    return 'preset1';
  });

  // Сохраняем изменения в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activePreset);
    } catch (error) {
      console.warn('Failed to save preset to localStorage:', error);
    }
  }, [activePreset]);

  return [activePreset, setActivePresetState];
}

/**
 * Проверка валидности пресета
 */
function isValidPreset(value: string): boolean {
  return ['preset1', 'preset2', 'preset3', 'preset4'].includes(value);
}
