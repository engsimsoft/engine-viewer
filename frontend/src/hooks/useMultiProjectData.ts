/**
 * Custom hook для загрузки данных из нескольких проектов
 *
 * Поддерживает cross-project comparison:
 * - Загружает данные для расчётов из разных проектов
 * - Кэширует загруженные данные в calculation.data
 * - Не перезагружает уже закэшированные данные
 * - Обрабатывает состояния loading/error
 */

import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/api/client';
import type { CalculationReference } from '@/types/v2';
import type { EngineProject } from '@/types';

/**
 * Результат работы hook
 */
export interface UseMultiProjectDataResult {
  /** Массив расчётов с загруженными данными */
  calculations: CalculationReference[];
  /** Флаг загрузки (true если хотя бы один проект загружается) */
  isLoading: boolean;
  /** Ошибка загрузки (если есть) */
  error: string | null;
  /** Функция для повторной загрузки данных */
  refetch: () => void;
  /** Прогресс загрузки (загружено / всего) */
  progress: { loaded: number; total: number };
}

/**
 * Hook для загрузки данных из нескольких проектов
 *
 * ВАЖНО:
 * - Данные кэшируются в calculation.data
 * - Повторная загрузка не происходит если данные уже есть
 * - При ошибке загрузки одного проекта, остальные продолжают загружаться
 *
 * @param calculations - Массив CalculationReference для загрузки
 * @returns Результат с данными, состоянием загрузки и функцией refetch
 *
 * @example
 * ```tsx
 * const primary = { projectId: "vesta-16-im", calculationId: "$1", ... };
 * const comp1 = { projectId: "bmw-m42", calculationId: "$5", ... };
 *
 * const { calculations, isLoading, error } = useMultiProjectData([primary, comp1]);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * // calculations[0].data содержит загруженные DataPoint[]
 * // calculations[1].data содержит загруженные DataPoint[]
 * ```
 */
export function useMultiProjectData(
  calculations: CalculationReference[]
): UseMultiProjectDataResult {
  // State для отслеживания загруженных данных
  const [loadedCalculations, setLoadedCalculations] = useState<CalculationReference[]>(calculations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  /**
   * Кэш загруженных проектов (в памяти hook)
   * Ключ: projectId, Значение: EngineProject
   */
  const [projectsCache] = useState<Map<string, EngineProject>>(new Map());

  /**
   * Загружает данные для всех расчётов
   */
  const loadData = useCallback(async () => {
    // Если нет расчётов - ничего не делаем
    if (calculations.length === 0) {
      setLoadedCalculations([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress({ loaded: 0, total: calculations.length });

    try {
      // Копируем массив calculations для мутации
      const updatedCalculations = [...calculations];
      let loadedCount = 0;
      const errors: string[] = [];

      // Загружаем данные для каждого расчёта
      for (let i = 0; i < updatedCalculations.length; i++) {
        const calc = updatedCalculations[i];

        // Пропускаем если данные уже загружены
        if (calc.data && calc.data.length > 0) {
          loadedCount++;
          setProgress({ loaded: loadedCount, total: calculations.length });
          continue;
        }

        try {
          // Проверяем кэш проекта
          let project = projectsCache.get(calc.projectId);

          // Если проекта нет в кэше - загружаем
          if (!project) {
            project = await projectsApi.getProject(calc.projectId);
            projectsCache.set(calc.projectId, project);
          }

          // Ищем нужный calculation в проекте
          const calculation = project.calculations.find(
            (c) => c.id === calc.calculationId
          );

          if (!calculation) {
            throw new Error(
              `Calculation ${calc.calculationId} not found in project ${calc.projectId}`
            );
          }

          // Кэшируем данные в calculation.data
          updatedCalculations[i] = {
            ...calc,
            data: calculation.dataPoints,
          };

          loadedCount++;
          setProgress({ loaded: loadedCount, total: calculations.length });
        } catch (err) {
          // Сохраняем ошибку, но продолжаем загрузку остальных
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          errors.push(
            `Failed to load ${calc.projectName} → ${calc.calculationName}: ${errorMessage}`
          );
          console.error(`Error loading calculation ${calc.calculationId}:`, err);
        }
      }

      // Обновляем state с загруженными данными
      setLoadedCalculations(updatedCalculations);

      // Если были ошибки - показываем их
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }
    } catch (err) {
      // Общая ошибка загрузки
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load calculation data'
      );
      console.error('Error in useMultiProjectData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [calculations, projectsCache]);

  /**
   * Загружаем данные при изменении списка calculations
   */
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (ignore) return;

      // Если нет расчётов - сбрасываем state
      if (calculations.length === 0) {
        setLoadedCalculations([]);
        setIsLoading(false);
        setError(null);
        setProgress({ loaded: 0, total: 0 });
        return;
      }

      await loadData();
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [calculations, loadData]);

  return {
    calculations: loadedCalculations,
    isLoading,
    error,
    refetch: loadData,
    progress,
  };
}

/**
 * Проверяет, загружены ли данные для calculation
 */
export function hasData(calc: CalculationReference): boolean {
  return calc.data !== undefined && calc.data.length > 0;
}

/**
 * Подсчитывает количество расчётов с загруженными данными
 */
export function countLoadedCalculations(
  calculations: CalculationReference[]
): number {
  return calculations.filter(hasData).length;
}

/**
 * Фильтрует расчёты, оставляя только те, у которых есть данные
 */
export function getLoadedCalculations(
  calculations: CalculationReference[]
): CalculationReference[] {
  return calculations.filter(hasData);
}
