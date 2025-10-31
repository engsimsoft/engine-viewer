/**
 * Peak Values Finder
 *
 * Утилиты для поиска и форматирования пиковых значений параметров
 * в расчётах двигателя.
 *
 * ВАЖНО:
 * - Пиковые значения отображаются в карточках (всегда видимы, не требуют hover)
 * - Параметры массивы (PCylMax, TCylMax, TUbMax) обрабатываются по-разному в разных preset'ах
 * - Названия параметров НЕ переводятся (P-Av, Torque, PCylMax и т.д.)
 */

import type { DataPoint } from '../types/index';
import type { PeakValue, Units } from '../types/v2';
import { convertPower, convertTorque, convertPressure, convertTemperature } from './unitsConverter';
import { getPowerUnit, getTorqueUnit, getPressureUnit, getTemperatureUnit } from './unitsConverter';

/**
 * Находит пиковое значение для простого числового параметра
 *
 * Используется для параметров типа number (P-Av, Torque, RPM, Convergence)
 *
 * @param dataPoints - Массив точек данных
 * @param parameter - Название параметра для поиска (P-Av, Torque и т.д.)
 * @returns Пиковое значение с информацией об оборотах
 *
 * @throws Если массив пуст или параметр не найден
 */
export function findPeak(
  dataPoints: DataPoint[],
  parameter: 'P-Av' | 'Torque' | 'RPM' | 'Convergence'
): PeakValue {
  if (dataPoints.length === 0) {
    throw new Error(`Cannot find peak: dataPoints array is empty`);
  }

  let maxValue = -Infinity;
  let maxRPM = 0;

  for (const point of dataPoints) {
    const value = point[parameter];
    if (value > maxValue) {
      maxValue = value;
      maxRPM = point.RPM;
    }
  }

  return {
    value: maxValue,
    rpm: maxRPM,
    parameter,
    displayLabel: `Max ${parameter}`,
  };
}

/**
 * Находит пиковое значение для параметра-массива (цилиндры)
 *
 * Ищет максимум для конкретного цилиндра в массиве параметров.
 *
 * @param dataPoints - Массив точек данных
 * @param parameter - Название параметра массива (PCylMax, TCylMax, TUbMax, PurCyl, Deto)
 * @param cylinderIndex - Индекс цилиндра (0-based: 0, 1, 2, 3)
 * @returns Пиковое значение для указанного цилиндра
 *
 * @throws Если массив пуст или индекс цилиндра некорректен
 */
export function findPeakForCylinder(
  dataPoints: DataPoint[],
  parameter: 'PCylMax' | 'TCylMax' | 'TUbMax' | 'PurCyl' | 'Deto',
  cylinderIndex: number
): PeakValue {
  if (dataPoints.length === 0) {
    throw new Error(`Cannot find peak: dataPoints array is empty`);
  }

  let maxValue = -Infinity;
  let maxRPM = 0;

  for (const point of dataPoints) {
    const arrayValue = point[parameter];
    if (arrayValue && arrayValue[cylinderIndex] !== undefined) {
      const value = arrayValue[cylinderIndex];
      if (value > maxValue) {
        maxValue = value;
        maxRPM = point.RPM;
      }
    }
  }

  // Cylinder numbering is 1-based in UI (1, 2, 3, 4)
  const cylinderNumber = cylinderIndex + 1;

  return {
    value: maxValue,
    rpm: maxRPM,
    parameter: `${parameter}(${cylinderNumber})`,
    displayLabel: `Max ${parameter}(${cylinderNumber})`,
  };
}

/**
 * Находит среднее значение параметра-массива и его пик
 *
 * Используется для Preset 3 (Temperature), где нужно усреднить значения по всем цилиндрам.
 *
 * @param dataPoints - Массив точек данных
 * @param parameter - Название параметра массива (TCylMax, TUbMax)
 * @returns Пиковое значение усреднённого параметра
 *
 * @throws Если массив пуст
 */
export function findPeakAveraged(
  dataPoints: DataPoint[],
  parameter: 'TCylMax' | 'TUbMax'
): PeakValue {
  if (dataPoints.length === 0) {
    throw new Error(`Cannot find peak: dataPoints array is empty`);
  }

  let maxAvgValue = -Infinity;
  let maxRPM = 0;

  for (const point of dataPoints) {
    const arrayValue = point[parameter];
    if (arrayValue && arrayValue.length > 0) {
      // Calculate average across all cylinders at this RPM
      const sum = arrayValue.reduce((acc, val) => acc + val, 0);
      const avgValue = sum / arrayValue.length;

      if (avgValue > maxAvgValue) {
        maxAvgValue = avgValue;
        maxRPM = point.RPM;
      }
    }
  }

  return {
    value: maxAvgValue,
    rpm: maxRPM,
    parameter,
    displayLabel: `Max ${parameter} (avg)`,
  };
}

/**
 * Находит пиковые значения для выбранного пресета графиков
 *
 * Каждый пресет определяет свой набор параметров для отображения пиков.
 *
 * Preset 1 (Power & Torque):
 * - Возвращает: [maxPAv, maxTorque]
 *
 * Preset 2 (Cylinder Pressure):
 * - Возвращает: [maxPCylMax1, maxPCylMax2, maxPCylMax3, maxPCylMax4]
 *
 * Preset 3 (Temperature):
 * - Возвращает: [maxTCylMax (avg), maxTUbMax (avg)]
 *
 * Preset 4 (Custom):
 * - Возвращает: peaks для параметров из customParams
 *
 * @param dataPoints - Массив точек данных
 * @param preset - Номер пресета (1, 2, 3, 4)
 * @param customParams - Опциональные пользовательские параметры для preset 4
 * @returns Массив пиковых значений для данного пресета
 *
 * @throws Если preset 4 используется без customParams
 */
export function findPeaksForPreset(
  dataPoints: DataPoint[],
  preset: 1 | 2 | 3 | 4,
  customParams?: string[]
): PeakValue[] {
  if (dataPoints.length === 0) {
    return [];
  }

  switch (preset) {
    case 1: {
      // Preset 1: Power & Torque
      const maxPower = findPeak(dataPoints, 'P-Av');
      const maxTorque = findPeak(dataPoints, 'Torque');
      return [maxPower, maxTorque];
    }

    case 2: {
      // Preset 2: Cylinder Pressure (4 cylinders)
      // Find peak pressure for each cylinder
      const numCylinders = dataPoints[0]?.PCylMax?.length || 4;
      const peaks: PeakValue[] = [];

      for (let i = 0; i < numCylinders; i++) {
        const peak = findPeakForCylinder(dataPoints, 'PCylMax', i);
        peaks.push(peak);
      }

      return peaks;
    }

    case 3: {
      // Preset 3: Temperature (averaged across cylinders)
      const maxTCyl = findPeakAveraged(dataPoints, 'TCylMax');
      const maxTUb = findPeakAveraged(dataPoints, 'TUbMax');
      return [maxTCyl, maxTUb];
    }

    case 4: {
      // Preset 4: Custom parameters
      if (!customParams || customParams.length === 0) {
        throw new Error('Preset 4 requires customParams array');
      }

      const peaks: PeakValue[] = [];

      for (const param of customParams) {
        // Check if parameter is a simple value or array
        if (param === 'P-Av' || param === 'Torque' || param === 'RPM' || param === 'Convergence') {
          const peak = findPeak(dataPoints, param as 'P-Av' | 'Torque' | 'RPM' | 'Convergence');
          peaks.push(peak);
        } else {
          // For array parameters, we could either:
          // 1. Average across cylinders
          // 2. Show all cylinders
          // For now, we'll average for simplicity
          const arrayParam = param as 'PCylMax' | 'TCylMax' | 'TUbMax' | 'PurCyl' | 'Deto';

          if (arrayParam === 'TCylMax' || arrayParam === 'TUbMax') {
            const peak = findPeakAveraged(dataPoints, arrayParam);
            peaks.push(peak);
          } else if (arrayParam === 'PCylMax' || arrayParam === 'PurCyl' || arrayParam === 'Deto') {
            // For other array params, find peak for first cylinder as representative
            const peak = findPeakForCylinder(dataPoints, arrayParam, 0);
            peaks.push(peak);
          }
        }
      }

      return peaks;
    }

    default:
      throw new Error(`Invalid preset: ${preset}. Must be 1, 2, 3, or 4.`);
  }
}

/**
 * Форматирует пиковое значение с конвертацией единиц измерения
 *
 * Примеры вывода:
 * - SI units: "92.5 kW at 6800 RPM"
 * - American units: "124.1 bhp at 6800 RPM"
 * - HP units: "125.8 PS at 6800 RPM"
 *
 * @param peak - Пиковое значение для форматирования
 * @param units - Система единиц измерения ('si', 'american', 'hp')
 * @param decimals - Количество знаков после запятой (0-3)
 * @returns Отформатированная строка с единицами измерения
 */
export function formatPeakValue(
  peak: PeakValue,
  units: Units,
  decimals: number
): string {
  let convertedValue = peak.value;
  let unit = '';

  // Determine parameter type and convert + get unit
  const paramLower = peak.parameter.toLowerCase();

  if (paramLower.includes('p-av') || paramLower.includes('power')) {
    // Power parameter
    convertedValue = convertPower(peak.value, units);
    unit = getPowerUnit(units);
  } else if (paramLower.includes('torque')) {
    // Torque parameter
    convertedValue = convertTorque(peak.value, units);
    unit = getTorqueUnit(units);
  } else if (paramLower.includes('pcylmax')) {
    // Pressure parameter
    convertedValue = convertPressure(peak.value, units);
    unit = getPressureUnit(units);
  } else if (paramLower.includes('tcylmax') || paramLower.includes('tubmax')) {
    // Temperature parameter
    convertedValue = convertTemperature(peak.value, units);
    unit = getTemperatureUnit(units);
  } else if (paramLower.includes('rpm')) {
    // RPM - no conversion needed
    unit = 'RPM';
  } else {
    // Other parameters - no conversion, no unit
    unit = '';
  }

  // Format value with specified decimals
  const formattedValue = convertedValue.toFixed(decimals);

  // Build display string
  if (unit) {
    return `${formattedValue} ${unit} at ${peak.rpm} RPM`;
  } else {
    return `${formattedValue} at ${peak.rpm} RPM`;
  }
}
