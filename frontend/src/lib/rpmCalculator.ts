/**
 * RPM Step Calculator
 *
 * Утилиты для расчёта и отображения информации о шаге оборотов (RPM step)
 * в расчётах двигателя.
 *
 * ВАЖНО:
 * - Средний шаг округляется до ближайшего значения кратного 50 (50, 100, 150, 200, ...)
 * - Используется для отображения метаданных расчёта вместо бесполезного количества точек
 */

import type { DataPoint } from '../types/index';

/**
 * Вычисляет средний шаг оборотов (RPM step) между точками данных
 *
 * Алгоритм:
 * 1. Извлекает все значения RPM из массива точек
 * 2. Сортирует значения по возрастанию
 * 3. Вычисляет разницу (шаг) между каждой парой соседних точек
 * 4. Усредняет все шаги
 * 5. Округляет результат до ближайшего значения кратного 50
 *
 * Примеры:
 * - Если шаги: [200, 200, 200, 200] → average: 200 → rounded: 200
 * - Если шаги: [180, 220, 190, 210] → average: 200 → rounded: 200
 * - Если шаги: [170, 180, 190] → average: 180 → rounded: 200
 * - Если шаги: [140, 150, 160] → average: 150 → rounded: 150
 *
 * @param dataPoints - Массив точек данных из расчёта
 * @returns Средний шаг оборотов, округлённый до ближайшего 50 (50, 100, 150, 200, 250, ...)
 *
 * @throws Если массив пуст или содержит менее 2 точек (невозможно вычислить шаг)
 */
export function calculateAverageStep(dataPoints: DataPoint[]): number {
  // Валидация входных данных
  if (dataPoints.length === 0) {
    throw new Error('Cannot calculate average step: dataPoints array is empty');
  }

  if (dataPoints.length === 1) {
    throw new Error('Cannot calculate average step: need at least 2 data points');
  }

  // Шаг 1: Извлечь все RPM значения
  const rpms = dataPoints.map(point => point.RPM);

  // Шаг 2: Отсортировать по возрастанию
  const sortedRpms = [...rpms].sort((a, b) => a - b);

  // Шаг 3: Вычислить шаги между соседними точками
  const steps: number[] = [];
  for (let i = 1; i < sortedRpms.length; i++) {
    const step = sortedRpms[i] - sortedRpms[i - 1];
    steps.push(step);
  }

  // Шаг 4: Усреднить шаги
  const sum = steps.reduce((acc, step) => acc + step, 0);
  const average = sum / steps.length;

  // Шаг 5: Округлить до ближайшего 50 (50, 100, 150, 200, 250...)
  const rounded = Math.round(average / 50) * 50;

  return rounded;
}

/**
 * Форматирует информацию о диапазоне оборотов и среднем шаге для отображения в UI
 *
 * Формат вывода: "2000-7800 RPM • ~200 RPM step"
 *
 * Примеры:
 * - formatRPMRange([2000, 7800], 200) → "2000-7800 RPM • ~200 RPM step"
 * - formatRPMRange([1000, 8000], 150) → "1000-8000 RPM • ~150 RPM step"
 * - formatRPMRange([3000, 6000], 100) → "3000-6000 RPM • ~100 RPM step"
 *
 * @param rpmRange - Кортеж [minRPM, maxRPM] с диапазоном оборотов
 * @param avgStep - Средний шаг оборотов (уже округлённый)
 * @returns Отформатированная строка с диапазоном и шагом
 */
export function formatRPMRange(
  rpmRange: [number, number],
  avgStep: number
): string {
  const [minRPM, maxRPM] = rpmRange;
  return `${minRPM}-${maxRPM} RPM • ~${avgStep} RPM step`;
}

/**
 * Извлекает диапазон оборотов (min и max RPM) из массива точек данных
 *
 * Вспомогательная функция для получения metadata.rpmRange при создании CalculationReference
 *
 * @param dataPoints - Массив точек данных
 * @returns Кортеж [minRPM, maxRPM]
 *
 * @throws Если массив пуст
 */
export function extractRPMRange(dataPoints: DataPoint[]): [number, number] {
  if (dataPoints.length === 0) {
    throw new Error('Cannot extract RPM range: dataPoints array is empty');
  }

  const rpms = dataPoints.map(point => point.RPM);
  const minRPM = Math.min(...rpms);
  const maxRPM = Math.max(...rpms);

  return [minRPM, maxRPM];
}
