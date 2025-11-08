/**
 * Global Application Store (Zustand)
 *
 * v3.0: Refactored into modular slices for better maintainability
 *
 * Architecture:
 * - settingsSlice: User preferences (persisted to localStorage)
 * - performanceSlice: Calculations, presets, UI modals (session-only)
 *
 * Slices are combined using Zustand's slice pattern with selective persistence.
 *
 * Persistence:
 * - Settings slice → localStorage (units, theme, chartSettings)
 * - Performance slice → session-only (calculations, UI state)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';
import { createPerformanceSlice, type PerformanceSlice } from './slices/performanceSlice';

/**
 * Combined App Store Type
 *
 * Merges all slices into a single store interface
 */
export type AppStore = SettingsSlice & PerformanceSlice;

/**
 * Global Application Store
 *
 * v3.0 Architecture:
 * - Modular slices (settings, performance)
 * - Selective persistence (only settings)
 * - Clean separation of concerns
 *
 * Usage:
 * ```tsx
 * const theme = useAppStore((state) => state.theme);
 * const setTheme = useAppStore((state) => state.setTheme);
 * const primaryCalculation = useAppStore((state) => state.primaryCalculation);
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createPerformanceSlice(...a),
    }),
    {
      name: 'engine-viewer-settings',
      storage: createJSONStorage(() => localStorage),
      // Persist ONLY settings slice (units, theme, chartSettings)
      partialize: (state) => ({
        units: state.units,
        theme: state.theme,
        chartSettings: state.chartSettings,
      }),
    }
  )
);
