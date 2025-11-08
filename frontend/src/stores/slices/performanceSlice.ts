/**
 * Performance Slice - Calculations, Presets, Custom Parameters
 *
 * v3.0: Extracted from monolithic appStore.ts
 *
 * Manages Performance page state:
 * - Primary/comparison calculations (cross-project support)
 * - Chart preset selection (1-6)
 * - Custom parameters selection (Preset 4)
 * - UI modal flags (primary modal, comparison modal, parameter selector)
 *
 * PERSISTED: No (session-only state)
 *
 * NOTE: This slice will be used by useDeepLinking hook to sync state with URL params.
 */

import type { StateCreator } from 'zustand';
import type {
  CalculationReference,
  SelectedParameter,
} from '../../types/v2';
import {
  CALCULATION_COLORS,
  MAX_COMPARISONS,
} from '../../types/v2';
import { PARAMETERS } from '../../config/parameters';

/**
 * Performance Slice State
 */
export interface PerformanceSlice {
  // ============================================================
  // Calculation State
  // ============================================================

  /** Primary calculation (always assigned CALCULATION_COLORS[0] - red) */
  primaryCalculation: CalculationReference | null;

  /** Comparison calculations (max 4, auto-assigned colors from palette) */
  comparisonCalculations: CalculationReference[];

  // ============================================================
  // Chart Preset State
  // ============================================================

  /** Selected chart preset (1-6) */
  selectedPreset: 1 | 2 | 3 | 4 | 5 | 6;

  /** Selected custom parameters for Preset 4 (Custom Chart) */
  selectedCustomParams: SelectedParameter[];

  // ============================================================
  // UI Modal State
  // ============================================================

  /** Settings popover open/closed */
  isSettingsOpen: boolean;

  /** Primary calculation selection modal open/closed */
  isPrimaryModalOpen: boolean;

  /** Comparison calculation selection modal open/closed */
  isComparisonModalOpen: boolean;

  /** Parameter selector modal open/closed (Preset 4) */
  isParameterSelectorOpen: boolean;

  // ============================================================
  // Actions
  // ============================================================

  // Calculation Management
  setPrimaryCalculation: (calc: CalculationReference) => void;
  clearPrimaryCalculation: () => void;
  addComparison: (calc: CalculationReference) => void;
  removeComparison: (index: number) => void;
  clearComparisons: () => void;

  // Preset Management
  setSelectedPreset: (preset: 1 | 2 | 3 | 4 | 5 | 6) => void;
  setSelectedCustomParams: (params: SelectedParameter[]) => void;
  toggleParameter: (paramId: string) => void;
  setCylinderSelection: (paramId: string, cylinder: 'avg' | number) => void;

  // UI Modals
  toggleSettings: () => void;
  togglePrimaryModal: () => void;
  toggleComparisonModal: () => void;
  toggleParameterSelector: () => void;
}

/**
 * Get next available color from palette
 * @param usedColors - Array of already used colors
 * @returns Next color from CALCULATION_COLORS
 */
function getNextColor(usedColors: string[]): string {
  const availableColor = CALCULATION_COLORS.find(
    (color) => !usedColors.includes(color)
  );
  return availableColor || CALCULATION_COLORS[0];
}

/**
 * Create Performance Slice
 *
 * @param set - Zustand set function
 * @returns Performance slice with state and actions
 */
export const createPerformanceSlice: StateCreator<PerformanceSlice> = (set) => ({
  // ============================================================
  // Initial State
  // ============================================================

  // Calculation State
  primaryCalculation: null,
  comparisonCalculations: [],

  // Preset State
  selectedPreset: 1, // Power & Torque by default
  selectedCustomParams: [
    { id: 'P-Av', cylinder: null },    // Default: P-Av (scalar)
    { id: 'Torque', cylinder: null },  // Default: Torque (scalar)
  ],

  // UI Modal State
  isSettingsOpen: false,
  isPrimaryModalOpen: false,
  isComparisonModalOpen: false,
  isParameterSelectorOpen: false,

  // ============================================================
  // Calculation Management Actions
  // ============================================================

  setPrimaryCalculation: (calc) =>
    set({
      primaryCalculation: {
        ...calc,
        // Primary always gets first color (red)
        color: CALCULATION_COLORS[0],
      },
    }),

  clearPrimaryCalculation: () =>
    set({
      primaryCalculation: null,
    }),

  addComparison: (calc) =>
    set((state) => {
      // Check: max comparisons limit
      if (state.comparisonCalculations.length >= MAX_COMPARISONS) {
        console.warn(
          `Cannot add more than ${MAX_COMPARISONS} comparison calculations`
        );
        return state;
      }

      // Collect all used colors
      const usedColors = [
        state.primaryCalculation?.color,
        ...state.comparisonCalculations.map((c) => c.color),
      ].filter(Boolean) as string[];

      // Assign next available color
      const nextColor = getNextColor(usedColors);

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
  // Preset Management Actions
  // ============================================================

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
          // Default: 'avg' for per-cylinder params, null for scalars
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

  // ============================================================
  // UI Modal Actions
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
});
