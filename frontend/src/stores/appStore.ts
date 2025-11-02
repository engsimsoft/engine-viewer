/**
 * Global Application Store (Zustand)
 *
 * Управляет глобальным состоянием приложения Engine Viewer v2.0
 *
 * Основные возможности:
 * - Управление primary и comparison расчётами (cross-project)
 * - Настройки единиц измерения (SI/American/HP)
 * - UI state (модалы, presets)
 * - Persistence для settings (localStorage)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  CalculationReference,
  ChartSettings,
  SelectedParameter,
} from '../types/v2';
import {
  CALCULATION_COLORS,
  MAX_COMPARISONS,
  DEFAULT_UNITS,
  DEFAULT_THEME,
} from '../types/v2';
import { PARAMETERS } from '../config/parameters';

/**
 * Расширенный интерфейс Store с actions
 */
interface AppStore extends AppState {
  // ============================================================
  // Calculation Management Actions
  // ============================================================

  /**
   * Установить primary расчёт
   * Автоматически назначает красный цвет (CALCULATION_COLORS[0])
   */
  setPrimaryCalculation: (calc: CalculationReference) => void;

  /**
   * Очистить primary расчёт
   */
  clearPrimaryCalculation: () => void;

  /**
   * Добавить расчёт для сравнения
   * Автоматически назначает следующий доступный цвет из палитры
   * Максимум 4 comparison расчёта
   */
  addComparison: (calc: CalculationReference) => void;

  /**
   * Удалить расчёт из сравнения по индексу
   */
  removeComparison: (index: number) => void;

  /**
   * Очистить все comparison расчёты
   */
  clearComparisons: () => void;

  // ============================================================
  // Settings Actions
  // ============================================================

  /**
   * Изменить систему единиц измерения
   */
  setUnits: (units: 'si' | 'american' | 'hp') => void;

  /**
   * Изменить тему оформления
   */
  setTheme: (theme: 'light' | 'dark') => void;

  /**
   * Обновить настройки графиков (частичное обновление)
   */
  updateChartSettings: (settings: Partial<ChartSettings>) => void;

  // ============================================================
  // UI State Actions
  // ============================================================

  /**
   * Переключить Settings popover
   */
  toggleSettings: () => void;

  /**
   * Переключить Primary Selection Modal
   */
  togglePrimaryModal: () => void;

  /**
   * Переключить Comparison Selection Modal
   */
  toggleComparisonModal: () => void;

  /**
   * Переключить Parameter Selector Modal (ChartPreset4)
   */
  toggleParameterSelector: () => void;

  /**
   * Установить выбранный preset графиков
   */
  setSelectedPreset: (preset: 1 | 2 | 3 | 4 | 5 | 6) => void;

  /**
   * Установить выбранные параметры для Custom Chart (Preset 4)
   */
  setSelectedCustomParams: (params: SelectedParameter[]) => void;

  /**
   * Toggle parameter selection for Custom Chart
   * Adds parameter if not selected, removes if already selected
   * For per-cylinder params, defaults to 'avg'
   */
  toggleParameter: (paramId: string) => void;

  /**
   * Set cylinder selection for a per-cylinder parameter
   * @param paramId - Parameter ID
   * @param cylinder - 'avg' or cylinder number (1-4)
   */
  setCylinderSelection: (paramId: string, cylinder: 'avg' | number) => void;
}

/**
 * Получить следующий доступный цвет из палитры
 * @param usedColors - массив уже используемых цветов
 * @returns следующий цвет из CALCULATION_COLORS
 */
function getNextColor(usedColors: string[]): string {
  // Найти первый неиспользованный цвет из палитры
  const availableColor = CALCULATION_COLORS.find(
    (color) => !usedColors.includes(color)
  );

  // Если все цвета использованы (не должно произойти, макс 5 расчётов)
  // вернуть первый цвет
  return availableColor || CALCULATION_COLORS[0];
}

/**
 * Глобальный store приложения с persistence
 *
 * Persisted state (localStorage):
 * - units (система единиц)
 * - theme (тема оформления)
 * - chartSettings (настройки графиков)
 *
 * Session-only state (НЕ persisted):
 * - primaryCalculation
 * - comparisonCalculations
 * - UI flags (isSettingsOpen, isPrimaryModalOpen, isComparisonModalOpen)
 * - selectedPreset
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
  // ============================================================
  // Initial State
  // ============================================================

  // Visualization State
  primaryCalculation: null,
  comparisonCalculations: [],

  // Settings (будут персистироваться в Task 1.2.3)
  units: DEFAULT_UNITS,
  theme: DEFAULT_THEME,
  chartSettings: {
    animation: true,
    showGrid: true,
    decimals: 2,
  },

  // UI State
  isSettingsOpen: false,
  isPrimaryModalOpen: false,
  isComparisonModalOpen: false,
  isParameterSelectorOpen: false, // Parameter Selector Modal (ChartPreset4)
  selectedPreset: 1, // Power & Torque по умолчанию
  selectedCustomParams: [
    { id: 'P-Av', cylinder: null },    // Default: P-Av (scalar parameter)
    { id: 'Torque', cylinder: null },  // Default: Torque (scalar parameter)
  ] as SelectedParameter[],

  // ============================================================
  // Calculation Management Actions
  // ============================================================

  setPrimaryCalculation: (calc) =>
    set({
      primaryCalculation: {
        ...calc,
        // Primary расчёт ВСЕГДА получает первый цвет (красный)
        color: CALCULATION_COLORS[0],
      },
    }),

  clearPrimaryCalculation: () =>
    set({
      primaryCalculation: null,
    }),

  addComparison: (calc) =>
    set((state) => {
      // Проверка: не превышен ли лимит
      if (state.comparisonCalculations.length >= MAX_COMPARISONS) {
        console.warn(
          `Cannot add more than ${MAX_COMPARISONS} comparison calculations`
        );
        return state; // не изменяем state
      }

      // Собрать все уже используемые цвета
      const usedColors = [
        state.primaryCalculation?.color,
        ...state.comparisonCalculations.map((c) => c.color),
      ].filter(Boolean) as string[];

      // Назначить следующий доступный цвет
      const nextColor = getNextColor(usedColors);

      // Добавить новый расчёт с назначенным цветом
      return {
        comparisonCalculations: [
          ...state.comparisonCalculations,
          {
            ...calc,
            color: nextColor,
          },
        ],
      };
    }),

  removeComparison: (index) =>
    set((state) => ({
      comparisonCalculations: state.comparisonCalculations.filter(
        (_, i) => i !== index
      ),
    })),

  clearComparisons: () =>
    set({
      comparisonCalculations: [],
    }),

  // ============================================================
  // Settings Actions
  // ============================================================

  setUnits: (units) =>
    set({
      units,
    }),

  setTheme: (theme) =>
    set({
      theme,
    }),

  updateChartSettings: (settings) =>
    set((state) => ({
      chartSettings: {
        ...state.chartSettings,
        ...settings,
      },
    })),

  // ============================================================
  // UI State Actions
  // ============================================================

  toggleSettings: () =>
    set((state) => ({
      isSettingsOpen: !state.isSettingsOpen,
    })),

  togglePrimaryModal: () =>
    set((state) => ({
      isPrimaryModalOpen: !state.isPrimaryModalOpen,
    })),

  toggleComparisonModal: () =>
    set((state) => ({
      isComparisonModalOpen: !state.isComparisonModalOpen,
    })),

  toggleParameterSelector: () =>
    set((state) => ({
      isParameterSelectorOpen: !state.isParameterSelectorOpen,
    })),

  setSelectedPreset: (preset) =>
    set({
      selectedPreset: preset,
    }),

  setSelectedCustomParams: (params) =>
    set({
      selectedCustomParams: params,
    }),

  toggleParameter: (paramId) =>
    set((state) => {
      const isSelected = state.selectedCustomParams.some(p => p.id === paramId);

      if (isSelected) {
        // Remove parameter (but keep at least 1)
        if (state.selectedCustomParams.length > 1) {
          return {
            selectedCustomParams: state.selectedCustomParams.filter(p => p.id !== paramId),
          };
        }
        // Cannot remove last parameter
        return state;
      } else {
        // Add parameter
        const param = PARAMETERS[paramId];
        const newParam: SelectedParameter = {
          id: paramId,
          // Default cylinder selection: 'avg' for per-cylinder params, null for scalars
          cylinder: param?.perCylinder ? 'avg' : null,
        };
        return {
          selectedCustomParams: [...state.selectedCustomParams, newParam],
        };
      }
    }),

  setCylinderSelection: (paramId, cylinder) =>
    set((state) => ({
      selectedCustomParams: state.selectedCustomParams.map(p =>
        p.id === paramId ? { ...p, cylinder } : p
      ),
    })),
    }),
    {
      name: 'engine-viewer-settings',
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только настройки, НЕ сохраняем calculations и UI state
      partialize: (state) => ({
        units: state.units,
        theme: state.theme,
        chartSettings: state.chartSettings,
      }),
    }
  )
);
