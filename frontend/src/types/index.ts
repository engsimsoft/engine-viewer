/**
 * TypeScript типы для Engine Results Viewer Frontend
 * Синхронизировано с backend/src/types/engineData.ts
 */

// ====================================================================
// Backend Types (синхронизировано с backend)
// ====================================================================

/**
 * Метаданные двигателя из первой строки .det файла
 */
export interface EngineMetadata {
  numCylinders: number;      // Количество цилиндров
  engineType: string;         // Тип двигателя (NATUR, TURBO и т.д.)
}

/**
 * Одна точка данных (одна строка из .det, .pou, или pou-merged файла)
 * Содержит все параметры для одной точки оборотов
 *
 * Format-specific parameters availability:
 * - .det: 24 parameters (includes TCylMax, PCylMax, Deto, Convergence)
 * - .pou: 71 parameters (does NOT include TCylMax, PCylMax, Deto, Convergence)
 * - pou-merged: 73 parameters (.pou + TCylMax, Convergence from .det)
 */
export interface DataPoint {
  // ===========================================
  // ALWAYS PRESENT (all formats)
  // ===========================================

  RPM: number;                // Обороты двигателя (об/мин)
  'P-Av': number;             // Средняя мощность (кВт)
  Torque: number;             // Крутящий момент (Н·м)

  // Коэффициент наполнения для каждого цилиндра
  PurCyl: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальная температура выпускных газов для каждого цилиндра (K)
  TUbMax: number[];           // [cyl1, cyl2, cyl3, cyl4, ...]

  // ===========================================
  // OPTIONAL (.det and pou-merged only)
  // ===========================================

  // Максимальная температура в цилиндре (K)
  // Available in: .det, pou-merged
  // NOT available in: .pou
  TCylMax?: number[];         // [cyl1, cyl2, cyl3, cyl4, ...]

  // Максимальное давление в цилиндре (бар)
  // Available in: .det, pou-merged
  // NOT available in: .pou
  PCylMax?: number[];         // [cyl1, cyl2, cyl3, cyl4, ...]

  // Детонация для каждого цилиндра
  // Available in: .det, pou-merged
  // NOT available in: .pou
  Deto?: number[];            // [cyl1, cyl2, cyl3, cyl4, ...]

  // Сходимость расчета
  // Available in: .det, pou-merged
  // NOT available in: .pou
  Convergence?: number;

  // ===========================================
  // OPTIONAL (.pou and pou-merged only)
  // ===========================================

  // Additional .pou parameters (not present in .det files)
  TexAv?: number;             // Average exhaust temperature
  Power?: number[];           // Power per cylinder
  IMEP?: number[];            // Indicated Mean Effective Pressure
  BMEP?: number[];            // Brake Mean Effective Pressure
  PMEP?: number[];            // Pumping Mean Effective Pressure
  FMEP?: number;              // Friction Mean Effective Pressure
  DRatio?: number[];          // Delivery Ratio
  Seff?: number[];            // Scavenging efficiency
  Teff?: number[];            // Trapping efficiency
  Ceff?: number[];            // Charging efficiency
  BSFC?: number[];            // Brake Specific Fuel Consumption
  'TC-Av'?: number[];         // Average cylinder temperature
  MaxDeg?: number[];          // Angle at max pressure
  Timing?: number;            // Ignition/injection timing
  Delay?: number[];           // Ignition delay
  Durat?: number[];           // Combustion duration
  TAF?: number;               // Total Air Flow
  VibeDelay?: number;         // Vibe model delay
  VibeDurat?: number;         // Vibe model duration
  VibeA?: number;             // Vibe parameter A
  VibeM?: number;             // Vibe parameter M
}

/**
 * Один расчет (calculation) - набор точек с одним маркером ($1, $2, и т.д.)
 *
 * ВАЖНО:
 * - Символ $ - технический маркер, который backend программы расчётов добавляет автоматически
 * - После $ идёт текст, который ввёл пользователь (это его название расчета)
 * - В UI показываем name (без $), а id (с $) используем для внутренней логики
 *
 * Примеры:
 *   Файл: "$3.1 R 0.86" → id: "$3.1 R 0.86", name: "3.1 R 0.86"
 *   Файл: "$baseline"   → id: "$baseline",   name: "baseline"
 */
export interface Calculation {
  id: string;                 // Уникальный ID расчета (с $) - для API и внутренней логики
  name: string;               // Название для отображения в UI (без $) - то, что ввёл пользователь
  dataPoints: DataPoint[];    // Массив точек данных для этого расчета
}

/**
 * Полный проект - все данные из одного .det файла
 */
export interface EngineProject {
  name: string;               // Имя проекта без расширения (например "Vesta 1.6 IM")
  fileName: string;           // Имя файла (например "Vesta 1.6 IM.det")
  metadata: EngineMetadata;   // Метаданные двигателя
  columnHeaders: string[];    // Заголовки колонок из строки 2
  calculations: Calculation[]; // Массив всех расчетов
}

// ====================================================================
// Engine Configuration Types (Metadata v1.0)
// ====================================================================

/**
 * Intake System Type (from .prt file)
 */
export type IntakeSystem = 'ITB' | 'IM';

/**
 * Exhaust System Type (from .prt file)
 */
export type ExhaustSystem = '4-2-1' | '4-1' | 'tri-y' | '4-1-2' | '8-4-2-1';

/**
 * Engine Configuration Type (from .prt file)
 */
export type EngineConfiguration = 'inline' | 'V' | 'boxer' | 'W';

/**
 * Error Severity Levels
 */
export type ErrorSeverity = 'warning' | 'error' | 'critical';

/**
 * Project Error Types
 */
export type ProjectErrorType =
  | 'missing_prt'           // Project has .det/.pou but NO .prt file
  | 'parsing_failed'        // .prt file exists but parsing threw error
  | 'incomplete_metadata'   // Critical fields are null
  | 'corrupted_files';      // Files exist but can't be read

/**
 * Single Error Object
 */
export interface ProjectError {
  type: ProjectErrorType;
  severity: ErrorSeverity;
  message: string;          // User-friendly error message
  details?: string;         // Technical details (for developers)
  timestamp: string;        // ISO date when error was detected
}

/**
 * Combustion Timing Curve (v3.2.0)
 * Single RPM point from Ignition Model Data section of .prt file
 */
export interface CombustionCurve {
  rpm: number;           // Engine speed (RPM)
  timing: number;        // Ignition advance angle (°BTDC)
  afr: number;           // Air-Fuel Ratio
  delay: number;         // Ignition delay period (°)
  duration: number;      // Combustion burn duration (°)
  vibeA: number;         // Wiebe parameter A
  vibeB: number;         // Wiebe parameter B
  beff: number;          // Combustion efficiency
}

/**
 * Combustion Data (v3.2.0)
 * Full combustion timing information from .prt file
 */
export interface CombustionData {
  fuelType: string;           // e.g., "100 UNLEADED"
  nitromethaneRatio: number;  // 0.0 - 1.0
  curves: CombustionCurve[];  // RPM-specific timing curves
}

/**
 * Automatic Metadata (read-only, extracted from .prt file)
 */
export interface AutoMetadata {
  cylinders: number;
  type: 'NA' | 'Turbo' | 'Supercharged';
  configuration: EngineConfiguration;
  bore: number;               // мм
  stroke: number;             // мм
  displacement?: number;      // Объем двигателя в литрах (calculated from bore, stroke, cylinders)
  compressionRatio: number;
  maxPowerRPM: number;
  intakeSystem: IntakeSystem;
  valvesPerCylinder: number;  // Total valves per cylinder (2, 3, 4, 5)
  inletValves: number;        // Number of inlet valves per cylinder
  exhaustValves: number;      // Number of exhaust valves per cylinder
  combustion?: CombustionData; // v3.2.0: Combustion timing data (optional for backward compatibility)
}

/**
 * Manual Metadata (user-editable)
 */
export interface ManualMetadata {
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  notes?: string;
  color?: string;             // hex color, например "#3b82f6"
}

/**
 * Project Metadata v1.0 (complete structure)
 * Stored in .metadata/<projectId>.json
 *
 * ВАЖНО: Разделение на auto (read-only) и manual (user-editable)
 * - auto: автоматически извлекается из .prt файла
 * - manual: редактируется пользователем через UI
 */
export interface ProjectMetadata {
  version: '1.0';
  id: string;                 // ID проекта (имя файла без расширения)
  displayName?: string;       // Кастомное название (опционально)
  auto?: AutoMetadata;        // Read-only данные из .prt
  manual: ManualMetadata;     // User-editable данные
  created: string;            // ISO дата создания метаданных
  modified: string;           // ISO дата последнего обновления
}

/**
 * Расширенная информация о проекте (для списка проектов)
 * Комбинирует данные из .det файла и метаданных v1.0
 */
export interface ProjectInfo {
  id: string;                 // ID проекта (имя файла без расширения)
  name: string;               // Имя проекта (без расширения)
  fileName: string;           // Полное имя файла
  displayName?: string;       // Кастомное название из metadata
  engineType: string;         // Тип двигателя (legacy field из .det)
  numCylinders: number;       // Количество цилиндров (legacy field из .det)
  calculationsCount: number;  // Количество расчетов
  lastModified: string;       // ISO дата последнего изменения файла
  created: string;            // ISO дата создания файла (birthtime)

  // Metadata v1.0 (опциональные, если не созданы пользователем)
  metadata?: ProjectMetadata;

  // Project Errors (опциональные, только если есть ошибки)
  errors?: ProjectError[];

  // Legacy flat fields (для backwards compatibility, deprecated)
  // TODO: Remove after migrating all components to use metadata structure
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  color?: string;
  notes?: string;
  updatedAt?: string;
}

// ====================================================================
// API Response Types
// ====================================================================

/**
 * Структура для API ответа со списком проектов
 */
export interface ProjectsListResponse {
  success: boolean;
  data: ProjectInfo[];
  meta: {
    total: number;
    scannedAt: number;
    scanDuration: number;
    directory: {
      path: string;
      totalSize: number;
      totalSizeFormatted: string;
    };
  };
}

/**
 * Структура для API ответа с детальными данными проекта
 */
export interface ProjectDetailsResponse {
  project: EngineProject;
}

/**
 * Параметры для фильтрации и выбора данных
 */
export interface DataQueryParams {
  calculationIds?: string[];  // ID расчетов для выбора (например ["$1", "$2"])
  rpmRange?: {                // Диапазон оборотов
    min: number;
    max: number;
  };
  parameters?: string[];      // Какие параметры вернуть (RPM, Torque, и т.д.)
}

// ====================================================================
// UI-Specific Types
// ====================================================================

/**
 * Режим отображения списка проектов
 */
export type ViewMode = 'cards' | 'list';

/**
 * Сортировка списка проектов
 */
export type SortBy = 'date' | 'name' | 'calculations' | 'status';

/**
 * Фильтр по статусу проекта
 */
export type FilterStatus = 'all' | 'active' | 'completed' | 'archived';

/**
 * Состояние загрузки данных
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Настройки отображения графиков
 */
export interface ChartPreset {
  id: string;
  name: string;
  description: string;
  parameters: string[];       // Список параметров для отображения
}

/**
 * Выбранные расчёты для сравнения (макс. 5)
 */
export interface SelectedCalculations {
  projectId: string;
  calculationIds: string[];   // Максимум 5
}

/**
 * Формат экспорта
 */
export type ExportFormat = 'png' | 'svg' | 'csv' | 'xlsx';

/**
 * Опции экспорта графика
 */
export interface ExportOptions {
  format: ExportFormat;
  fileName: string;
  width?: number;
  height?: number;
}

// ====================================================================
// PV-Diagrams Types (.pvd files)
// ====================================================================

/**
 * System configuration from .pvd file (lines 3-15)
 */
export interface PVDSystemConfig {
  numPipIn: number;      // Number of intake pipes
  numColIn: number;      // Number of intake collectors
  numBoxIn: number;      // Number of intake boxes
  numPipEx: number;      // Number of exhaust pipes
  numColEx: number;      // Number of exhaust collectors
  numBoxEx: number;      // Number of exhaust boxes
  numOutPipEx: number;   // Number of output exhaust pipes
  numStepExH: number;    // Number of exhaust step headers
  numStepEx: number;     // Number of exhaust steps
  numExSil: number;      // Number of exhaust silencers
  numExSilPlen: number;  // Number of exhaust silencer plenums
  iTraceL: number;       // Intake trace length
  eTraceL: number;       // Exhaust trace length
}

/**
 * Metadata from .pvd file (lines 1-17)
 */
export interface PVDMetadata {
  rpm: number;                    // Engine speed (RPM)
  cylinders: number;              // Number of cylinders
  engineType: 'NATUR' | 'TURBO';  // Engine type
  numTurbo: number;               // Number of turbochargers
  numExPas: number;               // Number of exhaust passages
  numSuper: number;               // Number of superchargers
  systemConfig: PVDSystemConfig;  // System configuration
  firingOrder: number[];          // Firing order / ignition timing (2 lines combined)
}

/**
 * Cylinder data at one crank angle
 * Contains Volume (cm³) and Pressure (bar) for one cylinder
 */
export interface PVDCylinderDataPoint {
  volume: number;    // Volume in cm³
  pressure: number;  // Pressure in bar
}

/**
 * One data point from .pvd file (one crank angle)
 * Line format: "deg  vol1 press1  vol2 press2  vol3 press3 ..."
 */
export interface PVDDataPoint {
  deg: number;                        // Crank angle (0-720°)
  cylinders: PVDCylinderDataPoint[];  // Data for each cylinder [cyl1, cyl2, ...]
}

/**
 * Complete parsed .pvd file data
 * Returned by parseEngineFile(filePath) via PvdParser
 */
export interface PVDData {
  metadata: PVDMetadata;   // Metadata from lines 1-17
  columnHeaders: string[]; // Column headers from line 18
  data: PVDDataPoint[];    // 721 data points (0-720° crank angle)
}

/**
 * File info with peak pressure metadata
 * Returned by GET /api/project/:id/pvd-files
 */
export interface PVDFileInfo {
  fileName: string;                  // File name (e.g., "V8_2000.pvd")
  rpm: number;                       // RPM from metadata
  cylinders: number;                 // Number of cylinders
  engineType: string;                // Engine type (NATUR, TURBO)
  peakPressure: number;              // Peak pressure across all cylinders (bar)
  peakPressureAngle: number;         // Physical crank angle at peak pressure (e.g., 14° ATDC)
  peakPressureAngleModified: number; // TDC2-shifted angle for graph centering (e.g., 374°)
  dataPoints: number;                // Number of data points (721)
}

/**
 * API response from GET /api/project/:id/pvd-files
 */
export interface PVDFilesResponse {
  success: boolean;
  data: {
    projectId: string;       // Project ID
    files: PVDFileInfo[];    // Array of .pvd files with metadata
  };
  meta: {
    totalFiles: number;      // Number of .pvd files found
    rpmPoints: number[];     // Unique RPM points sorted [3000, 3500, 4000, ...]
    parseDuration: number;   // Parse time in milliseconds
  };
}
