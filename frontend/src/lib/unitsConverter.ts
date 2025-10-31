/**
 * Units Conversion Utilities
 *
 * Конвертация значений между системами единиц измерения:
 * - SI (Международная): kW, N·m, bar, °C
 * - American: bhp, lb-ft, psi, °F
 * - HP (Гибридная): PS, N·m, bar, °C
 *
 * ВАЖНО:
 * - Все значения в .det файлах хранятся в SI единицах
 * - Конвертация происходит только для отображения в UI
 * - Названия параметров НЕ переводятся (всегда P-Av, Torque, PCylMax и т.д.)
 */

import type { Units } from '../types/v2';

// ====================================================================
// Conversion Coefficients
// ====================================================================

/**
 * Коэффициенты конвертации мощности
 */
const POWER_COEFFICIENTS = {
  kW_to_bhp: 1.341,  // kW → bhp (brake horsepower)
  kW_to_PS: 1.36,    // kW → PS (metric horsepower / Pferdestärke)
} as const;

/**
 * Коэффициенты конвертации крутящего момента
 */
const TORQUE_COEFFICIENTS = {
  Nm_to_lbft: 0.7376, // N·m → lb-ft (pound-feet)
} as const;

/**
 * Коэффициенты конвертации давления
 */
const PRESSURE_COEFFICIENTS = {
  bar_to_psi: 14.504, // bar → psi (pounds per square inch)
} as const;

// ====================================================================
// Power Conversion
// ====================================================================

/**
 * Конвертация мощности из kW в целевую систему единиц
 *
 * @param kW - мощность в киловаттах (исходные данные из .det)
 * @param targetUnits - целевая система единиц
 * @returns сконвертированное значение мощности
 *
 * @example
 * convertPower(92.5, 'si')       // → 92.5 (без изменений)
 * convertPower(92.5, 'american') // → 124.04 (bhp)
 * convertPower(92.5, 'hp')       // → 125.8 (PS)
 */
export function convertPower(kW: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
      return kW; // Без конвертации
    case 'american':
      return kW * POWER_COEFFICIENTS.kW_to_bhp; // kW → bhp
    case 'hp':
      return kW * POWER_COEFFICIENTS.kW_to_PS; // kW → PS
  }
}

// ====================================================================
// Torque Conversion
// ====================================================================

/**
 * Конвертация крутящего момента из N·m в целевую систему единиц
 *
 * @param Nm - крутящий момент в ньютон-метрах (исходные данные из .det)
 * @param targetUnits - целевая система единиц
 * @returns сконвертированное значение момента
 *
 * @example
 * convertTorque(178.3, 'si')       // → 178.3 (без изменений)
 * convertTorque(178.3, 'american') // → 131.5 (lb-ft)
 * convertTorque(178.3, 'hp')       // → 178.3 (без изменений, HP использует N·m)
 */
export function convertTorque(Nm: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp': // HP система использует N·m для момента
      return Nm; // Без конвертации
    case 'american':
      return Nm * TORQUE_COEFFICIENTS.Nm_to_lbft; // N·m → lb-ft
  }
}

// ====================================================================
// Pressure Conversion
// ====================================================================

/**
 * Конвертация давления из bar в целевую систему единиц
 *
 * @param bar - давление в барах (исходные данные из .det)
 * @param targetUnits - целевая система единиц
 * @returns сконвертированное значение давления
 *
 * @example
 * convertPressure(85.2, 'si')       // → 85.2 (без изменений)
 * convertPressure(85.2, 'american') // → 1235.64 (psi)
 * convertPressure(85.2, 'hp')       // → 85.2 (без изменений, HP использует bar)
 */
export function convertPressure(bar: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp': // HP система использует bar для давления
      return bar; // Без конвертации
    case 'american':
      return bar * PRESSURE_COEFFICIENTS.bar_to_psi; // bar → psi
  }
}

// ====================================================================
// Temperature Conversion
// ====================================================================

/**
 * Конвертация температуры из °C в целевую систему единиц
 *
 * @param celsius - температура в градусах Цельсия (исходные данные из .det)
 * @param targetUnits - целевая система единиц
 * @returns сконвертированное значение температуры
 *
 * @example
 * convertTemperature(850, 'si')       // → 850 (без изменений)
 * convertTemperature(850, 'american') // → 1562 (°F)
 * convertTemperature(850, 'hp')       // → 850 (без изменений, HP использует °C)
 */
export function convertTemperature(celsius: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp': // HP система использует °C для температуры
      return celsius; // Без конвертации
    case 'american':
      return (celsius * 9 / 5) + 32; // °C → °F
  }
}

// ====================================================================
// Unit Label Getters
// ====================================================================

/**
 * Получить метку единиц измерения мощности
 *
 * @param units - система единиц
 * @returns строка с единицей измерения
 *
 * @example
 * getPowerUnit('si')       // → "kW"
 * getPowerUnit('american') // → "bhp"
 * getPowerUnit('hp')       // → "PS"
 */
export function getPowerUnit(units: Units): string {
  switch (units) {
    case 'si':
      return 'kW';
    case 'american':
      return 'bhp'; // brake horsepower
    case 'hp':
      return 'PS'; // Pferdestärke (metric horsepower)
  }
}

/**
 * Получить метку единиц измерения крутящего момента
 *
 * @param units - система единиц
 * @returns строка с единицей измерения
 *
 * @example
 * getTorqueUnit('si')       // → "N·m"
 * getTorqueUnit('american') // → "lb-ft"
 * getTorqueUnit('hp')       // → "N·m"
 */
export function getTorqueUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp': // HP система использует N·m
      return 'N·m';
    case 'american':
      return 'lb-ft'; // pound-feet
  }
}

/**
 * Получить метку единиц измерения давления
 *
 * @param units - система единиц
 * @returns строка с единицей измерения
 *
 * @example
 * getPressureUnit('si')       // → "bar"
 * getPressureUnit('american') // → "psi"
 * getPressureUnit('hp')       // → "bar"
 */
export function getPressureUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp': // HP система использует bar
      return 'bar';
    case 'american':
      return 'psi'; // pounds per square inch
  }
}

/**
 * Получить метку единиц измерения температуры
 *
 * @param units - система единиц
 * @returns строка с единицей измерения
 *
 * @example
 * getTemperatureUnit('si')       // → "°C"
 * getTemperatureUnit('american') // → "°F"
 * getTemperatureUnit('hp')       // → "°C"
 */
export function getTemperatureUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp': // HP система использует °C
      return '°C';
    case 'american':
      return '°F'; // Fahrenheit
  }
}

// ====================================================================
// Format Helper
// ====================================================================

/**
 * Универсальная функция форматирования значения с конвертацией и единицами
 *
 * Автоматически определяет тип параметра, конвертирует значение
 * и форматирует с нужным количеством знаков после запятой + единица измерения.
 *
 * @param value - числовое значение в оригинальных единицах (из .det файла)
 * @param parameter - название параметра (P-Av, Torque, PCylMax, TCylMax, TUbMax и т.д.)
 * @param units - целевая система единиц
 * @param decimals - количество знаков после запятой (0-3)
 * @returns отформатированная строка со значением и единицей измерения
 *
 * @example
 * formatValue(92.5, 'P-Av', 'si', 1)       // → "92.5 kW"
 * formatValue(92.5, 'P-Av', 'american', 1) // → "124.1 bhp"
 * formatValue(92.5, 'P-Av', 'hp', 1)       // → "125.8 PS"
 *
 * formatValue(178.3, 'Torque', 'si', 1)       // → "178.3 N·m"
 * formatValue(178.3, 'Torque', 'american', 1) // → "131.5 lb-ft"
 *
 * formatValue(85.2, 'PCylMax', 'american', 0) // → "1236 psi"
 * formatValue(850, 'TCylMax', 'american', 0)  // → "1562 °F"
 */
export function formatValue(
  value: number,
  parameter: string,
  units: Units,
  decimals: number
): string {
  // Определение типа параметра по названию
  let convertedValue: number;
  let unitLabel: string;

  // Power parameters (P-Av, P-Max и т.д.)
  if (parameter.startsWith('P-') || parameter === 'Power') {
    convertedValue = convertPower(value, units);
    unitLabel = getPowerUnit(units);
  }
  // Torque parameter
  else if (parameter === 'Torque') {
    convertedValue = convertTorque(value, units);
    unitLabel = getTorqueUnit(units);
  }
  // Pressure parameters (PCylMax, PMax и т.д.)
  else if (parameter.startsWith('PCyl') || parameter.startsWith('PMax')) {
    convertedValue = convertPressure(value, units);
    unitLabel = getPressureUnit(units);
  }
  // Temperature parameters (TCylMax, TUbMax и т.д.)
  else if (parameter.startsWith('TCyl') || parameter.startsWith('TUb') || parameter.startsWith('TMax')) {
    convertedValue = convertTemperature(value, units);
    unitLabel = getTemperatureUnit(units);
  }
  // Другие параметры (PurCyl, Deto, Convergence, RPM и т.д.) - без конвертации
  else {
    convertedValue = value;
    unitLabel = ''; // Без единицы измерения
  }

  // Форматирование с заданным количеством знаков после запятой
  const formattedNumber = convertedValue.toFixed(decimals);

  // Возврат с единицей измерения (если есть)
  return unitLabel ? `${formattedNumber} ${unitLabel}` : formattedNumber;
}
