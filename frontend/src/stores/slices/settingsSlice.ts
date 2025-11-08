/**
 * Settings Slice - Theme, Units, Chart Preferences
 *
 * v3.0: Extracted from monolithic appStore.ts
 *
 * Manages user preferences that should be persisted to localStorage:
 * - Theme (light/dark)
 * - Units system (SI/American/HP)
 * - Chart display settings (animation, grid, decimals)
 *
 * PERSISTED: Yes (localStorage via zustand/middleware persist)
 */

import type { StateCreator } from 'zustand';
import type { ChartSettings } from '../../types/v2';
import { DEFAULT_UNITS, DEFAULT_THEME } from '../../types/v2';

/**
 * Settings State
 */
export interface SettingsSlice {
  // State
  units: 'si' | 'american' | 'hp';
  theme: 'light' | 'dark';
  chartSettings: ChartSettings;

  // Actions
  setUnits: (units: 'si' | 'american' | 'hp') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

/**
 * Create Settings Slice
 *
 * @param set - Zustand set function
 * @returns Settings slice with state and actions
 */
export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  // ============================================================
  // Initial State
  // ============================================================

  units: DEFAULT_UNITS,
  theme: DEFAULT_THEME,
  chartSettings: {
    animation: true,
    showGrid: true,
    decimals: 2,
  },

  // ============================================================
  // Actions
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
});
