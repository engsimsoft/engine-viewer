/**
 * Units Conversion Utilities
 *
 * Phase 1 - Section 1.3 (retroactively created for Phase 4)
 * Phase 8 - Section 8.2 - Refactored to use PARAMETERS config
 *
 * Supports 3 unit systems:
 * - SI: kW, N·m, bar, °C
 * - American: bhp, lb-ft, psi, °F
 * - HP: PS, N·m, bar, °C (hybrid system, only power in HP)
 *
 * ВАЖНО: Все исходные значения в базе данных хранятся в SI единицах!
 * - Power: kW
 * - Torque: N·m
 * - Pressure: bar
 * - Temperature: °C (Celsius, уже в файлах .det/.pou)
 */

import type { Units } from '@/types/v2';
import { PARAMETERS } from '@/config/parameters';

// ====================================================================
// Conversion Functions
// ====================================================================

/**
 * Convert power from kW to target units
 * @param kW - Power in kilowatts (source units)
 * @param targetUnits - Target unit system
 * @returns Converted power value
 */
export function convertPower(kW: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
      return kW; // kW → kW (no conversion)
    case 'american':
      return kW * 1.341; // kW → bhp (brake horsepower)
    case 'hp':
      return kW * 1.36; // kW → PS (metric horsepower)
    default:
      return kW;
  }
}

/**
 * Convert torque from N·m to target units
 * @param Nm - Torque in Newton-meters (source units)
 * @param targetUnits - Target unit system
 * @returns Converted torque value
 */
export function convertTorque(Nm: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp':
      return Nm; // N·m → N·m (no conversion, HP system uses N·m for torque)
    case 'american':
      return Nm * 0.7376; // N·m → lb-ft (pound-feet)
    default:
      return Nm;
  }
}

/**
 * Convert pressure from bar to target units
 * @param bar - Pressure in bars (source units)
 * @param targetUnits - Target unit system
 * @returns Converted pressure value
 */
export function convertPressure(bar: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp':
      return bar; // bar → bar (no conversion, HP system uses bar for pressure)
    case 'american':
      return bar * 14.504; // bar → psi (pounds per square inch)
    default:
      return bar;
  }
}

/**
 * Convert temperature from Celsius to target units
 * @param celsius - Temperature in Celsius (source units)
 * @param targetUnits - Target unit system
 * @returns Converted temperature value
 */
export function convertTemperature(celsius: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'si':
    case 'hp':
      return celsius; // °C → °C (no conversion, HP system uses °C for temperature)
    case 'american':
      return (celsius * 9) / 5 + 32; // °C → °F (Fahrenheit)
    default:
      return celsius;
  }
}

// ====================================================================
// Unit Label Getters
// ====================================================================

/**
 * Get power unit label for target unit system
 * @param units - Target unit system
 * @returns Unit label string (e.g., "kW", "bhp", "PS")
 */
export function getPowerUnit(units: Units): string {
  switch (units) {
    case 'si':
      return 'kW';
    case 'american':
      return 'bhp';
    case 'hp':
      return 'PS';
    default:
      return 'kW';
  }
}

/**
 * Get torque unit label for target unit system
 * @param units - Target unit system
 * @returns Unit label string (e.g., "N·m", "lb-ft")
 */
export function getTorqueUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp':
      return 'N·m';
    case 'american':
      return 'lb-ft';
    default:
      return 'N·m';
  }
}

/**
 * Get pressure unit label for target unit system
 * @param units - Target unit system
 * @returns Unit label string (e.g., "bar", "psi")
 */
export function getPressureUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp':
      return 'bar';
    case 'american':
      return 'psi';
    default:
      return 'bar';
  }
}

/**
 * Get temperature unit label for target unit system
 * @param units - Target unit system
 * @returns Unit label string (e.g., "°C", "°F")
 */
export function getTemperatureUnit(units: Units): string {
  switch (units) {
    case 'si':
    case 'hp':
      return '°C';
    case 'american':
      return '°F';
    default:
      return '°C';
  }
}

/**
 * Get unit label for a parameter based on unit system
 *
 * Uses PARAMETERS config to determine conversion type, then returns
 * appropriate unit label for the target unit system.
 *
 * @param parameter - Parameter name (e.g., 'P-Av', 'Torque', 'PCylMax')
 * @param units - Target unit system
 * @returns Unit label string (e.g., "kW", "bhp", "bar", "psi")
 *
 * @example
 * ```ts
 * getParameterUnit('P-Av', 'si')       // "kW"
 * getParameterUnit('P-Av', 'american') // "bhp"
 * getParameterUnit('Torque', 'american') // "lb-ft"
 * getParameterUnit('PCylMax', 'american') // "psi"
 * getParameterUnit('RPM', 'si')        // "об/мин" (from config)
 * ```
 */
export function getParameterUnit(parameter: string, units: Units): string {
  const param = PARAMETERS[parameter];
  if (!param) {
    console.warn(`Unknown parameter: ${parameter}`);
    return '';
  }

  // Use conversion type to determine unit
  switch (param.conversionType) {
    case 'power':
      return getPowerUnit(units);
    case 'torque':
      return getTorqueUnit(units);
    case 'pressure':
      return getPressureUnit(units);
    case 'temperature':
      return getTemperatureUnit(units);
    case 'none':
    default:
      // For parameters without conversion, return SI unit from config
      return param.unit;
  }
}

// ====================================================================
// Format Value Helper
// ====================================================================

/**
 * Convert and format a value with its unit label
 *
 * Uses PARAMETERS config to determine conversion type (Phase 8).
 *
 * @param value - Raw value in SI units
 * @param parameter - Parameter name (P-Av, Torque, PCylMax, TCylMax, etc.)
 * @param units - Target unit system
 * @param decimals - Number of decimal places (0-3)
 * @returns Formatted string with value and unit (e.g., "92.5 kW", "124.1 bhp")
 *
 * @example
 * ```ts
 * formatValue(92.5, 'P-Av', 'si', 1) // "92.5 kW"
 * formatValue(92.5, 'P-Av', 'american', 1) // "124.1 bhp"
 * formatValue(320, 'Torque', 'american', 0) // "236 lb-ft"
 * formatValue(180, 'PCylMax', 'american', 2) // "2610.72 psi"
 * ```
 */
export function formatValue(
  value: number,
  parameter: string,
  units: Units,
  decimals: number
): string {
  // Get parameter metadata from config
  const param = PARAMETERS[parameter];
  if (!param) {
    console.warn(`Unknown parameter: ${parameter}`);
    return value.toFixed(decimals); // No conversion for unknown parameters
  }

  // Apply conversion based on parameter's conversion type
  let convertedValue: number;
  switch (param.conversionType) {
    case 'power':
      convertedValue = convertPower(value, units);
      break;
    case 'torque':
      convertedValue = convertTorque(value, units);
      break;
    case 'pressure':
      convertedValue = convertPressure(value, units);
      break;
    case 'temperature':
      convertedValue = convertTemperature(value, units);
      break;
    case 'none':
    default:
      convertedValue = value; // No conversion needed
      break;
  }

  // Get unit label for this parameter and unit system
  const unitLabel = getParameterUnit(parameter, units);

  // Format with specified decimal places
  const formattedValue = convertedValue.toFixed(decimals);

  // Return with unit label (if exists)
  return unitLabel ? `${formattedValue} ${unitLabel}` : formattedValue;
}

/**
 * Convert a single value based on parameter type
 * (without formatting or unit label)
 *
 * Uses PARAMETERS config to determine conversion type (Phase 8).
 *
 * @param value - Raw value in SI units
 * @param parameter - Parameter name
 * @param units - Target unit system
 * @returns Converted value
 */
export function convertValue(
  value: number,
  parameter: string,
  units: Units
): number {
  // Get parameter metadata from config
  const param = PARAMETERS[parameter];
  if (!param) {
    console.warn(`Unknown parameter: ${parameter}`);
    return value; // No conversion for unknown parameters
  }

  // Apply conversion based on parameter's conversion type
  switch (param.conversionType) {
    case 'power':
      return convertPower(value, units);
    case 'torque':
      return convertTorque(value, units);
    case 'pressure':
      return convertPressure(value, units);
    case 'temperature':
      return convertTemperature(value, units);
    case 'none':
    default:
      return value; // No conversion needed
  }
}
