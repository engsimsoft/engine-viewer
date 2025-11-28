import { useState, useCallback } from 'react';
import { projectsApi } from '@/api/client';
import { toast } from 'sonner';

/**
 * Custom hook для управления расчётами проекта
 *
 * Предоставляет функции для:
 * - Переименования расчёта (маркера)
 * - Удаления расчёта
 *
 * @param projectId - ID проекта
 * @param onSuccess - Callback вызывается при успешной операции (для refetch данных)
 *
 * @example
 * ```tsx
 * const { renameCalculation, deleteCalculation, isLoading } = useCalculationMutations(
 *   projectId,
 *   () => refetchProject() // Обновить данные проекта после изменения
 * );
 *
 * // Переименование
 * await renameCalculation('$3.1 R 0.86', '$baseline');
 *
 * // Удаление
 * await deleteCalculation('$2');
 * ```
 */
export function useCalculationMutations(
  projectId: string | undefined,
  onSuccess?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Переименовать расчёт
   *
   * @param calculationId - Текущий ID расчёта (e.g., "$3.1 R 0.86")
   * @param newId - Новый ID расчёта (e.g., "$baseline")
   */
  const renameCalculation = useCallback(
    async (calculationId: string, newId: string) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        await projectsApi.renameCalculation(
          projectId,
          calculationId,
          newId
        );

        toast.success('Calculation renamed', {
          description: `"${calculationId}" renamed to "${newId}"`,
        });

        // Вызываем callback для обновления данных
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to rename calculation';
        setError(errorMessage);

        toast.error('Failed to rename calculation', {
          description: errorMessage,
        });

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, onSuccess]
  );

  /**
   * Удалить расчёт
   *
   * @param calculationId - ID расчёта для удаления (e.g., "$2")
   */
  const deleteCalculation = useCallback(
    async (calculationId: string) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        await projectsApi.deleteCalculation(
          projectId,
          calculationId
        );

        toast.success('Calculation deleted', {
          description: `"${calculationId}" was removed from project`,
        });

        // Вызываем callback для обновления данных
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete calculation';
        setError(errorMessage);

        toast.error('Failed to delete calculation', {
          description: errorMessage,
        });

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, onSuccess]
  );

  return {
    renameCalculation,
    deleteCalculation,
    isLoading,
    error,
  };
}
