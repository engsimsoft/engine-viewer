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
 * - `performance`: Performance metrics (RPM, P-Av, Torque, PCylMax, Power)
 * - `mep`: Mean Effective Pressure parameters (FMEP, BMEP, IMEP, PMEP)
 * - `temperature`: Temperature parameters (TexAv, TC-Av, TUbMax)
 * - `combustion`: Combustion parameters (Timing, TAF, Deto, MaxDeg, Delay, Durat)
 * - `efficiency`: Efficiency parameters (DRatio, Seff, Teff, Ceff, PurCyl, BSFC)
 * - `vibe-model`: Vibe combustion model parameters (VibeDelay, VibeDurat, VibeA, VibeM)
 * - `quality`: Calculation quality indicators (Convergence)
 */
export type ParameterCategory = 'performance' | 'mep' | 'temperature' | 'combustion' | 'efficiency' | 'vibe-model' | 'quality';

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
 * - `temperature`: Temperature values (°C ↔ °F)
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
   * @example 'kW', 'N·m', 'bar', '°C', 'об/мин', ''
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
   * Brief description (1 sentence) for tooltips and parameter selector
   *
   * Short explanation shown on hover in UI.
   *
   * @optional
   */
  brief?: string;

  /**
   * Detailed description for Help page
   *
   * Full explanation for non-technical users, shown in Help modal/page.
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
   * Used for "Show 1 cylinder / ALL" button in UI.
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
    unit: 'rpm',
    conversionType: 'none',
    category: 'performance',
    formats: ['det', 'pou'],
    chartable: true,
    brief: 'Simulated engine rpm',
    description: 'This is the rpm value for which the following results were obtained. If a batch run was conducted these results will form a power curve that can be displayed. If single point runs were conducted these are just data and the file can be opened with any text editor and the results examined.',
  },

  'P-Av': {
    name: 'P-Av',
    displayName: 'Average Power',
    unit: 'kW',
    conversionType: 'power',
    category: 'performance',
    formats: ['det', 'pou'],
    chartable: true,
    brief: 'Average engine total power over a number of cycles (kW)',
    description: 'Because of the cyclic variability of an engine, the power is averaged over a number of cycles: Average engine total power over the last three cycles for a naturally aspirated engine. The same for a Supercharged engine but with the power absorbed by the Compressor and its drive subtracted. Average engine total power over the last forty cycles for a Turbocharged engine.',
  },

  'Torque': {
    name: 'Torque',
    displayName: 'Engine Torque',
    unit: 'N·m',
    conversionType: 'torque',
    category: 'performance',
    formats: ['det', 'pou'],
    chartable: true,
    brief: 'The engine torque calculated from the P-av value (Nm)',
    description: 'This torque value is the torque calculated from the averaged power and is thus the averaged torque over the last 3 cycles.',
  },

  'Convergence': {
    name: 'Convergence',
    displayName: 'Calculation Convergence',
    unit: '',
    conversionType: 'none',
    category: 'quality',
    formats: ['det'],
    chartable: false,
    description: 'Convergence of the calculation (quality indicator)',
  },

  'TexAv': {
    name: 'TexAv',
    displayName: 'Average Exhaust Temperature',
    unit: '°C',
    conversionType: 'temperature',
    category: 'temperature',
    formats: ['pou'],
    chartable: true,
    brief: 'Average temperature in center of exhaust (°C)',
    description: 'This is the average bulk temperature of the gas at the trace position defined for the cylinder and its position is measured from the piston. This is the value used to tune engines using an EGT guage.',
  },

  'FMEP': {
    name: 'FMEP',
    displayName: 'Friction Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'mep',
    formats: ['pou'],
    chartable: true,
    brief: 'Friction mean effective pressure (bar)',
    description: 'This is the frictional and other parasitic losses in the engine expressed as an average pressure.',
  },

  'Timing': {
    name: 'Timing',
    displayName: 'Ignition Timing',
    unit: '°BTDC',
    conversionType: 'none',
    category: 'combustion',
    formats: ['pou'],
    chartable: true,
    brief: 'Ignition timing (°BTDC)',
    description: 'This is the number of degrees before (or after) TDC where the actual spark happens for a spark ignition engine and the start of injection for a compression ignition engine.',
  },

  'TAF': {
    name: 'TAF',
    displayName: 'Trapped Air/Fuel Ratio',
    unit: '',
    conversionType: 'none',
    category: 'combustion',
    formats: ['pou'],
    chartable: true,
    brief: 'Trapped Air/fuel ratio',
    description: 'This is the prescribed air/fuel ratio as specified in the combustion subsystem.',
  },

  // ========================================
  // PER-CYLINDER PARAMETERS (Arrays)
  // ========================================

  'PCylMax': {
    name: 'PCylMax',
    displayName: 'Max Cylinder Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'performance',
    formats: ['det', 'pou-merged'],
    chartable: true,
    perCylinder: true,
    brief: 'Maximum pressure per cylinder (bar)',
    description: 'Maximum pressure in combustion chamber per cylinder.',
  },

  'Deto': {
    name: 'Deto',
    displayName: 'Detonation',
    unit: '',
    conversionType: 'none',
    category: 'combustion',
    formats: ['det', 'pou-merged'],
    chartable: true,
    perCylinder: true,
    brief: 'The count of the number of detonations per cylinder over the last 4 cycles',
    description: 'The count of the number of detonations per cylinder over the last 4 cycles. Range: 0 to 4.',
  },

  'TUbMax': {
    name: 'TUbMax',
    displayName: 'Max Unburned Mixture Temperature',
    unit: '°C',
    conversionType: 'temperature',
    category: 'temperature',
    formats: ['det', 'pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Maximum unburned mixture temperature per cylinder (°C)',
    description: 'This is the highest temperature the gas in the unburnt zone reaches without being part of the burnt zone. This temperature is one of the strongest indicators of whether detonation will occur or not.',
  },

  'PurCyl': {
    name: 'PurCyl',
    displayName: 'Mixture Purity',
    unit: '',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['det', 'pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Purity of the mixture in the cylinder at inlet valve closure',
    description: 'The purity is defined as the ratio of the air trapped at inlet valve closure to the total mass of the cylinder charge.',
  },

  'Power': {
    name: 'Power',
    displayName: 'Power per Cylinder',
    unit: 'kW',
    conversionType: 'power',
    category: 'performance',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Power per cylinder (kW)',
    description: 'This is the power produced by each cylinder over the last cycle. On a single cylinder engine comparing this value to the one averaged over 3 cycles (P-av) gives an indication of the cyclic variability.',
  },

  'IMEP': {
    name: 'IMEP',
    displayName: 'Indicated Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'mep',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Indicated mean effective pressure per cylinder (bar)',
    description: 'This is the averaged pressure value in the cylinder over a simulation cycle and is an indication of the maximum power the engine can make if there was no pumping or friction losses.',
  },

  'BMEP': {
    name: 'BMEP',
    displayName: 'Brake Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'mep',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Brake mean effective pressure per cylinder (bar)',
    description: 'This is the averaged cylinder pressure calculated from the netto power as measured on an engine dyno (or an engine simulation such as this) and takes the frictional and pumping losses into account. Comparing the BMEP with the IMEP gives a good indication of the mechanical and pumping efficiencies. A more efficient engine will have a smaller difference.',
  },

  'PMEP': {
    name: 'PMEP',
    displayName: 'Pumping Mean Effective Pressure',
    unit: 'bar',
    conversionType: 'pressure',
    category: 'mep',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Pumping mean effective pressure per cylinder (bar)',
    description: 'This is the average pumping work done in the cylinder and crankcase expressed as an average pressure.',
  },

  'DRatio': {
    name: 'DRatio',
    displayName: 'Delivery Ratio',
    unit: '',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Delivery ratio per cylinder',
    description: 'The delivery ratio of the engine defines the mass of air supplied during the scavenge period as a function of the reference mass which is the mass required to fill the swept volume under the atmospheric conditions.',
  },

  'Seff': {
    name: 'Seff',
    displayName: 'Scavenging Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Purity of the mixture in the cylinder at exhaust valve closure',
    description: 'The scavenging efficiency defines the effectiveness of the scavenging process during the overlap period.',
  },

  'Teff': {
    name: 'Teff',
    displayName: 'Trapping Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Trapping efficiency per cylinder',
    description: 'The trapping efficiency is the ratio of the delivered air that has been trapped to the total amount of delivered air.',
  },

  'Ceff': {
    name: 'Ceff',
    displayName: 'Charging Efficiency',
    unit: '',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Charging efficiency per cylinder',
    description: 'Charging efficiency expresses the ratio of actually filling the cylinder with air by comparison with filling the same cylinder perfectly with air.',
  },

  'BSFC': {
    name: 'BSFC',
    displayName: 'Brake Specific Fuel Consumption',
    unit: 'kg/kWh',
    conversionType: 'none',
    category: 'efficiency',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Brake specific fuel consumption per cylinder (kg/kWh)',
    description: 'This is the ratio of the fuel consumption rate to the power produced by that fuel.',
  },

  'TC-Av': {
    name: 'TC-Av',
    displayName: 'Average Cylinder Temperature',
    unit: '°C',
    conversionType: 'temperature',
    category: 'temperature',
    formats: ['det', 'pou'],  // .det files map TCylMax → TC-Av
    chartable: true,
    perCylinder: true,
    brief: 'Average maximum cylinder temperature per cylinder (°C)',
    description: 'The maximum cylinder temperature averaged over the number of cylinders. This is the value that is calculated from the cylinder pressure and is somewhere between the burnt and unburnt zone temperatures.',
  },

  'MaxDeg': {
    name: 'MaxDeg',
    displayName: 'Angle at Max Pressure',
    unit: '°ATDC',
    conversionType: 'none',
    category: 'combustion',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'Degrees after TDC where maximum cylinder pressure occurs per cylinder',
    description: 'For maximum power it is typical to set the ignition timing to have maximum cylinder pressure to occur around 8-12° ATDC.',
  },

  'Delay': {
    name: 'Delay',
    displayName: 'Ignition Delay',
    unit: '°',
    conversionType: 'none',
    category: 'combustion',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'The user prescribed delay period in degrees (deg)',
    description: 'The period from spark or injection to about 1% mass fraction burned. The flame kernel in this part is primarily grown through laminar burning.',
  },

  'Durat': {
    name: 'Durat',
    displayName: 'Combustion Duration',
    unit: '°',
    conversionType: 'none',
    category: 'combustion',
    formats: ['pou'],
    chartable: true,
    perCylinder: true,
    brief: 'The user prescribed combustion duration (burn period) in degrees (deg)',
    description: 'This is the period from the end of the delay period until about 99.9% of the mixture has been burned.',
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
    chartable: true,
    brief: 'The calculated delay period for a turbulent combustion model',
    description: 'The calculated delay period for a turbulent combustion model (for the prescribed combustion model it is the same as "Delay").',
  },

  'VibeDurat': {
    name: 'VibeDurat',
    displayName: 'Vibe Duration',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: true,
    brief: 'The calculated burn period for a turbulent combustion model',
    description: 'The calculated burn period for a turbulent combustion model (for the prescribed combustion model it is the same as "Durat").',
  },

  'VibeA': {
    name: 'VibeA',
    displayName: 'Vibe Parameter A',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: true,
    brief: 'The calculated Vibe A value for a turbulent combustion model',
    description: 'The calculated Vibe A value for a turbulent combustion model (for the prescribed combustion model it is the same as prescribed).',
  },

  'VibeM': {
    name: 'VibeM',
    displayName: 'Vibe Parameter M',
    unit: '',
    conversionType: 'none',
    category: 'vibe-model',
    formats: ['pou'],
    chartable: true,
    brief: 'The calculated Vibe M value for a turbulent combustion model',
    description: 'The calculated Vibe M value for a turbulent combustion model (for the prescribed combustion model it is the same as prescribed).',
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
