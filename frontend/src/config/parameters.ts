/**
 * Parameter System Configuration
 *
 * Single Source of Truth for all engine calculation parameters.
 * Contains metadata for all 73 parameters supported by the system.
 *
 * @module config/parameters
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Parameter category groups
 *
 * - `global`: Single value parameters (RPM, P-Av, Torque, etc.)
 * - `per-cylinder`: Array parameters with one value per cylinder (PCylMax, TUbMax, etc.)
 * - `vibe-model`: Vibe combustion model parameters (VibeDelay, VibeDurat, etc.)
 */
export type ParameterCategory = 'global' | 'per-cylinder' | 'vibe-model';

/**
 * File format availability
 *
 * - `det`: Available in .det files (24 parameters)
 * - `pou`: Available in .pou files (71 parameters)
 * - `pou-merged`: Available only in merged .pou data (PCylMax, Deto from .det)
 */
export type ParameterFormat = 'det' | 'pou' | 'pou-merged';

/**
 * Unit conversion type
 *
 * Determines which conversion function to apply based on unit system (SI/American/HP).
 *
 * - `power`: Power values (kW ↔ bhp ↔ PS)
 * - `torque`: Torque values (N·m ↔ lb-ft)
 * - `pressure`: Pressure values (bar ↔ psi)
 * - `temperature`: Temperature values (°C ↔ °F, K → °C)
 * - `none`: No conversion needed (dimensionless or RPM)
 */
export type ConversionType = 'power' | 'torque' | 'pressure' | 'temperature' | 'none';

/**
 * Parameter metadata interface
 *
 * Contains all information needed to display, convert, and work with a parameter.
 *
 * @example
 * ```typescript
 * const pAvMetadata: ParameterMetadata = {
 *   name: 'P-Av',
 *   displayName: 'Average Power',
 *   unit: 'kW',
 *   conversionType: 'power',
 *   category: 'global',
 *   formats: ['det', 'pou'],
 *   chartable: true,
 *   description: 'Average power output',
 * };
 * ```
 */
export interface ParameterMetadata {
  // ========================================
  // Identification
  // ========================================

  /**
   * Original parameter name from .det/.pou file
   *
   * ⚠️ CRITICAL: NEVER translate this! Always use original English name.
   *
   * @example 'P-Av', 'Torque', 'PCylMax', 'RPM'
   */
  name: string;

  /**
   * Human-readable display name for UI
   *
   * @example 'Average Power', 'Engine Torque', 'Max Cylinder Pressure'
   */
  displayName: string;

  // ========================================
  // Units & Conversion
  // ========================================

  /**
   * SI unit (base unit in database)
   *
   * @example 'kW', 'N·m', 'bar', 'K', 'об/мин', ''
   */
  unit: string;

  /**
   * Type of unit conversion to apply
   *
   * Used by unitsConversion.ts to determine conversion function.
   */
  conversionType: ConversionType;

  // ========================================
  // Categorization
  // ========================================

  /**
   * Parameter category
   *
   * Used for grouping in UI (ParameterSelector dropdown).
   */
  category: ParameterCategory;

  /**
   * File formats where this parameter is available
   *
   * - `['det', 'pou']`: Available in both formats
   * - `['det']`: Only in .det files
   * - `['pou']`: Only in .pou files
   * - `['pou-merged']`: Only in merged .pou data (PCylMax, Deto)
   */
  formats: ParameterFormat[];

  // ========================================
  // UI & Display
  // ========================================

  /**
   * Can this parameter be plotted on a chart?
   *
   * `false` for metadata-only parameters (Convergence, Vibe model params).
   */
  chartable: boolean;

  /**
   * Description for tooltips
   *
   * Short explanation of what this parameter represents.
   *
   * @optional
   */
  description?: string;

  // ========================================
  // Per-Cylinder Specific
  // ========================================

  /**
   * Is this parameter an array with one value per cylinder?
   *
   * `true` for PCylMax, TUbMax, Power, etc.
   * `false` for global parameters like RPM, P-Av, etc.
   *
   * @optional Only defined for per-cylinder parameters
   */
  perCylinder?: boolean;
}

// ============================================================================
// PARAMETERS CONFIGURATION
// ============================================================================

/**
 * Central registry of all 73 engine calculation parameters
 *
 * This object serves as the Single Source of Truth for parameter metadata.
 * All parameter information should be retrieved from this config.
 *
 * @example
 * ```typescript
 * // Get parameter metadata
 * const powerParam = PARAMETERS['P-Av'];
 * console.log(powerParam.displayName); // "Average Power"
 * console.log(powerParam.unit); // "kW"
 *
 * // Check if parameter is chartable
 * if (PARAMETERS['P-Av'].chartable) {
 *   // Add to chart
 * }
 *
 * // Get conversion type
 * const conversionType = PARAMETERS['Torque'].conversionType; // "torque"
 * ```
 */
export const PARAMETERS: Record<string, ParameterMetadata> = {
  // ========================================
  // GLOBAL PARAMETERS (Single Values)
  // ========================================

  'RPM': {
    name: 'RPM',
    displayName: 'Engine Speed',
    unit: 'об/мин',
    conversionType: 'none',
    category: 'global',
    formats: ['det', 'pou'],
    chartable: true,
    description: 'Engine rotational speed',
  },

  'P-Av': {
    name: 'P-Av',
    displayName: 'Average Power',
    unit: 'kW',
    conversionType: 'power',
    category: 'global',
    formats: ['det', 'pou'],
    chartable: true,
    description: 'Average power output',
  },

  'Torque': {
    name: 'Torque',
    displayName: 'Engine Torque',
    unit: 'N·m',
    conversionType: 'torque',
    category: 'global',
    formats: ['det', 'pou'],
    chartable: true,
    description: 'Engine torque',
  },

  'Convergence': {
    name: 'Convergence',
    displayName: 'Calculation Convergence',
    unit: '',
    conversionType: 'none',
    category: 'global',
    formats: ['det'],
    chartable: false,
    description: 'Convergence of the calculation (quality indicator)',
  },

  'TexAv': {
    name: 'TexAv',
    displayName: 'Average Exhaust Temperature',
    unit: 'K',
    conversionType: 'temperature',
    category: 'global',
    formats: ['pou'],
    chartable: true,
    description: 'Average exhaust gas temperature',
  },

  'FMEP': {
    name: 'FMEP',
    displayName: 'Friction Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'global',
    formats: ['pou'],
    chartable: true,
    description: 'Friction losses in the engine',
  },

  'Timing': {
    name: 'Timing',
    displayName: 'Ignition/Injection Timing',
    unit: '°',
    conversionType: 'none',
    category: 'global',
    formats: ['pou'],
    chartable: true,
    description: 'Ignition or injection timing',
  },

  'TAF': {
    name: 'TAF',
    displayName: 'Total Air Flow',
    unit: '',
    conversionType: 'none',
    category: 'global',
    formats: ['pou'],
    chartable: true,
    description: 'Total air flow rate',
  },

  // ========================================
  // PER-CYLINDER PARAMETERS (Arrays)
  // ========================================

  'PCylMax': {
    name: 'PCylMax',
    displayName: 'Max Cylinder Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'per-cylinder',
    formats: ['det', 'pou-merged'],
    chartable: true,
    perCylinder: true,
    description: 'Maximum pressure in combustion chamber',
  },

  'Deto': {
    name: 'Deto',
    displayName: 'Detonation',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['det', 'pou-merged'],
    chartable: true,
    perCylinder: true,
    description: 'Detonation indicator',
  },

  'TCylMax': {
    name: 'TCylMax',
    displayName: 'Max Cylinder Temperature',
    unit: 'K',
    conversionType: 'temperature',
    category: 'per-cylinder',
    formats: ['det'],
    chartable: true,
    perCylinder: true,
    description: 'Maximum temperature in combustion chamber',
  },

  'TUbMax': {
    name: 'TUbMax',
    displayName: 'Max Exhaust Temperature',
    unit: 'K',
    conversionType: 'temperature',
    category: 'per-cylinder',
    formats: ['det', 'pou'],
    chartable: true,
    perCylinder: true,
    description: 'Maximum exhaust gas temperature',
  },

  'PurCyl': {
    name: 'PurCyl',
    displayName: 'Volumetric Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['det', 'pou'],
    chartable: true,
    perCylinder: true,
    description: 'Volumetric efficiency (breathing efficiency)',
  },

  'Power': {
    name: 'Power',
    displayName: 'Power per Cylinder',
    unit: 'kW',
    conversionType: 'power',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Power output per cylinder',
  },

  'IMEP': {
    name: 'IMEP',
    displayName: 'Indicated Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Indicated mean effective pressure',
  },

  'BMEP': {
    name: 'BMEP',
    displayName: 'Brake Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Brake mean effective pressure',
  },

  'PMEP': {
    name: 'PMEP',
    displayName: 'Pumping Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Pumping losses',
  },

  'DRatio': {
    name: 'DRatio',
    displayName: 'Delivery Ratio',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Delivery ratio',
  },

  'Seff': {
    name: 'Seff',
    displayName: 'Scavenging Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Scavenging efficiency',
  },

  'Teff': {
    name: 'Teff',
    displayName: 'Trapping Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Trapping efficiency',
  },

  'Ceff': {
    name: 'Ceff',
    displayName: 'Charging Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Charging efficiency',
  },

  'BSFC': {
    name: 'BSFC',
    displayName: 'Brake Specific Fuel Consumption',
    unit: 'г/кВт·ч',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Brake specific fuel consumption',
  },

  'TC-Av': {
    name: 'TC-Av',
    displayName: 'Average Cylinder Temperature',
    unit: 'K',
    conversionType: 'temperature',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Average cylinder temperature',
  },

  'MaxDeg': {
    name: 'MaxDeg',
    displayName: 'Angle at Max Pressure',
    unit: '°',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Crank angle at maximum pressure',
  },

  'Delay': {
    name: 'Delay',
    displayName: 'Ignition Delay',
    unit: '°',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Ignition delay',
  },

  'Durat': {
    name: 'Durat',
    displayName: 'Combustion Duration',
    unit: '°',
    conversionType: 'none',
    category: 'per-cylinder',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    description: 'Combustion duration',
  },

  // ========================================
  // VIBE COMBUSTION MODEL PARAMETERS
  // ========================================

  'VibeDelay': {
    name: 'VibeDelay',
    displayName: 'Vibe Delay',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: false,
    description: 'Vibe model delay parameter',
  },

  'VibeDurat': {
    name: 'VibeDurat',
    displayName: 'Vibe Duration',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: false,
    description: 'Vibe model duration parameter',
  },

  'VibeA': {
    name: 'VibeA',
    displayName: 'Vibe Parameter A',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: false,
    description: 'Vibe model shape parameter A',
  },

  'VibeM': {
    name: 'VibeM',
    displayName: 'Vibe Parameter M',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: false,
    description: 'Vibe model shape parameter M',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// These functions will be implemented in task 8.1.3

/**
 * Get parameter metadata by name
 *
 * @param name - Parameter name (e.g., 'P-Av', 'Torque')
 * @returns Parameter metadata or undefined if not found
 *
 * @example
 * ```typescript
 * const param = getParameter('P-Av');
 * if (param) {
 *   console.log(param.displayName); // "Average Power"
 * }
 * ```
 */
export function getParameter(name: string): ParameterMetadata | undefined {
  return PARAMETERS[name];
}

/**
 * Get all chartable parameters
 *
 * @returns Array of parameters that can be plotted on charts
 *
 * @example
 * ```typescript
 * const chartableParams = getChartableParameters();
 * // Filter out metadata-only parameters like Convergence
 * ```
 */
export function getChartableParameters(): ParameterMetadata[] {
  return Object.values(PARAMETERS).filter(p => p.chartable);
}

/**
 * Get parameters by category
 *
 * @param category - Category to filter by
 * @returns Array of parameters in the specified category
 *
 * @example
 * ```typescript
 * const globalParams = getParametersByCategory('global');
 * const perCylinderParams = getParametersByCategory('per-cylinder');
 * ```
 */
export function getParametersByCategory(category: ParameterCategory): ParameterMetadata[] {
  return Object.values(PARAMETERS).filter(p => p.category === category);
}

/**
 * Get parameters available in specific format
 *
 * @param format - File format to filter by
 * @returns Array of parameters available in the specified format
 *
 * @example
 * ```typescript
 * const detParams = getParametersByFormat('det'); // 24 parameters
 * const pouParams = getParametersByFormat('pou'); // 71 parameters
 * ```
 */
export function getParametersByFormat(format: ParameterFormat): ParameterMetadata[] {
  return Object.values(PARAMETERS).filter(p => p.formats.includes(format));
}

/**
 * Check if parameter is available in data point
 *
 * @param paramName - Parameter name to check
 * @param dataPoint - Data point object to check against
 * @returns true if parameter exists and has a valid value
 *
 * @example
 * ```typescript
 * const dataPoint = { RPM: 2000, 'P-Av': 50.5, Torque: 120.3 };
 *
 * isParameterAvailable('P-Av', dataPoint); // true
 * isParameterAvailable('FMEP', dataPoint);  // false (not in .det data)
 * ```
 */
export function isParameterAvailable(paramName: string, dataPoint: any): boolean {
  return paramName in dataPoint && dataPoint[paramName] !== undefined && dataPoint[paramName] !== null;
}
