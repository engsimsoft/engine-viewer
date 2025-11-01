/**
 * TypeScript типы для Engine Results Viewer v2.0
 *
 * Новая архитектура с поддержкой:
 * - Cross-project calculation comparison
 * - Multi-calculation visualization (1 primary + 4 comparisons)
 * - Units conversion
 * - Peak values tracking
 */

import type { DataPoint } from './index';

// ====================================================================
// Core Data Types
// ====================================================================

/**
 * Данные расчёта - массив точек данных
 * Используется для кэширования загруженных данных в CalculationReference
 */
export type CalculationData = DataPoint[];

/**
 * Ссылка на расчёт из любого проекта
 *
 * ВАЖНО:
 * - Может ссылаться на расчёт из ЛЮБОГО проекта (cross-project)
 * - Данные загружаются по требованию и кэшируются в поле data
 * - Каждый расчёт имеет уникальный цвет для визуализации
 * - Метаданные используются для отображения в UI (RPM range, step и т.д.)
 *
 * Примеры:
 *   Primary: { projectId: "vesta-16-im", calculationId: "$1", color: "#ff6b6b", ... }
 *   Comparison: { projectId: "bmw-m42", calculationId: "$5", color: "#4ecdc4", ... }
 */
export interface CalculationReference {
  // Идентификация проекта
  projectId: string;         // ID проекта (имя файла без расширения) - "vesta-16-im"
  projectName: string;       // Название проекта для отображения - "Vesta 1.6 IM"

  // Идентификация расчёта
  calculationId: string;     // ID расчёта из .det файла (с $) - "$1"
  calculationName: string;   // Название расчёта для отображения - "$1" or "$BMW M42 14 UpDate"

  // Визуализация
  color: string;             // Цвет из палитры для графиков/легенд (hex) - "#ff6b6b"

  // Метаданные расчёта
  metadata: {
    rpmRange: [number, number];  // Диапазон оборотов [min, max] - [2000, 7800]
    avgStep: number;             // Средний шаг RPM (округлённый) - 200
    pointsCount: number;         // Количество точек данных (для внутреннего использования) - 26
    engineType: string;          // Тип двигателя - "NATUR", "TURBO"
    cylinders: number;           // Количество цилиндров - 4, 6, 8 и т.д.
  };

  // Кэшированные данные (загружаются по требованию)
  data?: CalculationData;    // Массив точек данных, загруженный с API
}

// ====================================================================
// Peak Values
// ====================================================================

/**
 * Пиковое значение параметра
 *
 * Используется для отображения максимальных значений на графиках и в карточках.
 * Например: "Max P-Av: 92.5 kW at 6800 RPM"
 *
 * ВАЖНО:
 * - value - числовое значение (в оригинальных единицах из .det файла)
 * - rpm - обороты, при которых достигнуто максимальное значение
 * - parameter - название параметра БЕЗ перевода (P-Av, Torque, PCylMax и т.д.)
 * - displayLabel - человекочитаемая метка для UI (может содержать единицы измерения)
 */
export interface PeakValue {
  value: number;           // Числовое значение пика - 92.5
  rpm: number;             // Обороты при пике - 6800
  parameter: string;       // Название параметра (БЕЗ перевода!) - "P-Av", "Torque"
  displayLabel: string;    // Метка для отображения - "Max P-Av: 92.5 kW at 6800 RPM"
}

// ====================================================================
// Application State
// ====================================================================

/**
 * Настройки графиков
 */
export interface ChartSettings {
  animation: boolean;       // Включены ли анимации графиков
  showGrid: boolean;        // Показывать ли сетку на графике
  decimals: number;         // Количество знаков после запятой (0-3)
}

/**
 * Глобальное состояние приложения (Zustand store)
 *
 * ВАЖНО:
 * - primaryCalculation - основной расчёт (всегда красный цвет #ff6b6b)
 * - comparisonCalculations - до 4 расчётов для сравнения (любые проекты)
 * - Максимум 5 расчётов одновременно: 1 primary + 4 comparisons
 * - Settings (units, theme, chartSettings) сохраняются в localStorage
 * - Calculations НЕ сохраняются (session-only)
 */
export interface AppState {
  // ============================================================
  // Visualization State
  // ============================================================

  /**
   * Основной (primary) расчёт для визуализации
   * null = пользователь ещё не выбрал расчёт (empty state)
   */
  primaryCalculation: CalculationReference | null;

  /**
   * Дополнительные расчёты для сравнения (максимум 4)
   * Могут быть из любых проектов (cross-project comparison)
   */
  comparisonCalculations: CalculationReference[];  // max length: 4

  // ============================================================
  // Settings (persisted to localStorage)
  // ============================================================

  /**
   * Система единиц измерения
   * - 'si': Международная система (kW, N·m, bar, °C)
   * - 'american': Американская система (bhp, lb-ft, psi, °F)
   * - 'hp': Гибридная система (PS, N·m, bar, °C)
   */
  units: 'si' | 'american' | 'hp';

  /**
   * Тема оформления
   * - 'light': Светлая тема
   * - 'dark': Тёмная тема
   */
  theme: 'light' | 'dark';

  /**
   * Настройки отображения графиков
   */
  chartSettings: ChartSettings;

  // ============================================================
  // UI State (not persisted)
  // ============================================================

  /**
   * Флаг открытия Settings popover
   */
  isSettingsOpen: boolean;

  /**
   * Флаг открытия Primary Selection Modal
   */
  isPrimaryModalOpen: boolean;

  /**
   * Флаг открытия Comparison Selection Modal (2-step)
   */
  isComparisonModalOpen: boolean;

  /**
   * Выбранный пресет графиков
   * 1 = Power & Torque
   * 2 = Cylinder Pressure
   * 3 = Temperature
   * 4 = Custom
   */
  selectedPreset: 1 | 2 | 3 | 4;

  /**
   * Выбранные параметры для Custom Chart (Preset 4)
   * Используется для синхронизации между ChartPreset4 и DataTable
   * Default: ['P-Av', 'Torque']
   */
  selectedCustomParams: string[];
}

// ====================================================================
// Units System
// ====================================================================

/**
 * Тип для систем единиц измерения
 */
export type Units = 'si' | 'american' | 'hp';

// ====================================================================
// Constants
// ====================================================================

/**
 * Палитра цветов для расчётов (v2.1 - Engineering Style with maximum contrast)
 *
 * Цвета назначаются в следующем порядке:
 * 1. Primary calculation - ВСЕГДА первый цвет (red)
 * 2. Comparison 1 - второй цвет (green) - яркий контраст
 * 3. Comparison 2 - третий цвет (blue) - чистый синий
 * 4. Comparison 3 - четвёртый цвет (orange) - яркий оранжевый
 * 5. Comparison 4 - пятый цвет (purple) - уникальный фиолетовый
 */
export const CALCULATION_COLORS = [
  "#e74c3c",  // red (primary) - bright red with good contrast
  "#2ecc71",  // green - vibrant green, easily distinguishable from all others
  "#3498db",  // blue - clear blue, distinct from green
  "#f39c12",  // orange - bright orange for high visibility
  "#9b59b6",  // purple - distinct purple
] as const;

/**
 * Максимальное количество расчётов для сравнения (не включая primary)
 */
export const MAX_COMPARISONS = 4;

/**
 * Система единиц по умолчанию
 */
export const DEFAULT_UNITS = 'si';

/**
 * Тема по умолчанию
 */
export const DEFAULT_THEME = 'light';
