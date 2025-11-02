import type { CalculationReference } from '@/types/v2';

/**
 * Preset names mapping
 */
const PRESET_NAMES: Record<number, string> = {
  1: 'PowerTorque',
  2: 'MEP',
  3: 'Critical',
  4: 'CustomChart',
  5: 'Combustion',
};

/**
 * Sanitize filename by replacing spaces with dashes and removing special characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, '-')  // Replace spaces with dashes
    .replace(/[^\w\-]/g, '') // Remove special characters except dash
    .replace(/--+/g, '-');   // Replace multiple dashes with single dash
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate chart export filename
 *
 * Rules:
 * - Single calculation: "EngineName_PresetName_Date.ext"
 * - Multiple calculations: "Multi-Project-Comparison_PresetName_Date.ext"
 *
 * @param calculations - Array of CalculationReference (primary + comparisons)
 * @param presetNumber - Preset number (1-5)
 * @returns Base filename (without extension)
 *
 * @example
 * ```ts
 * // Single project
 * generateChartFilename([vestalCalc], 1)
 * // → "Vesta-1.6-IM_PowerTorque_2025-10-31"
 *
 * // Multi-project comparison
 * generateChartFilename([vestalCalc, bmwCalc], 1)
 * // → "Multi-Project-Comparison_PowerTorque_2025-10-31"
 * ```
 */
export function generateChartFilename(
  calculations: CalculationReference[],
  presetNumber: 1 | 2 | 3 | 4 | 5
): string {
  const presetName = PRESET_NAMES[presetNumber] || 'Chart';
  const date = getCurrentDate();

  // If multiple calculations → Multi-Project-Comparison
  if (calculations.length > 1) {
    return `Multi-Project-Comparison_${presetName}_${date}`;
  }

  // If single calculation → EngineName_PresetName_Date
  if (calculations.length === 1) {
    const engineName = sanitizeFilename(calculations[0].projectName);
    return `${engineName}_${presetName}_${date}`;
  }

  // Fallback: no calculations (shouldn't happen)
  return `Chart_${presetName}_${date}`;
}
