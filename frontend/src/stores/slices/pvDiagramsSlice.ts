/**
 * PV-Diagrams Slice - Multi-RPM Comparison & Educational Features
 *
 * v3.1: Educational enhancements - multi-RPM comparison
 *
 * Manages user selections for PV-Diagram visualization:
 * - Selected RPMs (multi-select for comparison, 2-4 files)
 * - Diagram type (P-V, Log P-V, P-α)
 * - Educational toggles (cycle phases, markers, valve timing)
 *
 * PERSISTED: No (session-only, resets on page reload)
 * NOTE: Cylinder selection removed - always shows Cylinder 1 (educational simplification)
 */

import type { StateCreator } from 'zustand';

/**
 * Diagram Type for PV-Diagram visualization
 */
export type DiagramType = 'pv' | 'log-pv' | 'p-alpha';

/**
 * PV-Diagrams State
 */
export interface PVDiagramsSlice {
  // State
  selectedRPMs: string[];           // Selected .pvd file names for comparison (max 4)
  selectedDiagramType: DiagramType; // Diagram type (default: 'pv')
  showPumpingLosses: boolean;       // Zoom to pumping losses (0-2 bar) for P-V diagram

  // Actions - RPM Selection
  addSelectedRPM: (rpm: string) => void;
  removeSelectedRPM: (rpm: string) => void;
  clearSelectedRPMs: () => void;
  setSelectedDiagramType: (type: DiagramType) => void;
  setShowPumpingLosses: (value: boolean) => void;
  resetPVDiagrams: () => void;
}

/**
 * Create PV-Diagrams Slice
 *
 * @param set - Zustand set function
 * @returns PV-Diagrams slice with state and actions
 */
export const createPVDiagramsSlice: StateCreator<PVDiagramsSlice> = (set) => ({
  // ============================================================
  // Initial State
  // ============================================================

  selectedRPMs: [], // Empty = no files selected yet
  selectedDiagramType: 'pv', // Default: Normal P-V Diagram
  showPumpingLosses: false, // Default: full range view

  // ============================================================
  // Actions - RPM Selection (Multi-select)
  // ============================================================

  /**
   * Add RPM to selection (max 4 RPMs for educational comparison)
   */
  addSelectedRPM: (rpm) =>
    set((state) => {
      // Prevent duplicates
      if (state.selectedRPMs.includes(rpm)) {
        return state;
      }

      // Limit to 4 RPMs (educational limit - too many = clutter)
      if (state.selectedRPMs.length >= 4) {
        console.warn('Maximum 4 RPMs can be selected for comparison');
        return state;
      }

      return {
        selectedRPMs: [...state.selectedRPMs, rpm],
      };
    }),

  /**
   * Remove RPM from selection
   */
  removeSelectedRPM: (rpm) =>
    set((state) => ({
      selectedRPMs: state.selectedRPMs.filter((r) => r !== rpm),
    })),

  /**
   * Clear all selected RPMs
   */
  clearSelectedRPMs: () =>
    set({
      selectedRPMs: [],
    }),

  setSelectedDiagramType: (type) =>
    set({
      selectedDiagramType: type,
    }),

  setShowPumpingLosses: (value) =>
    set({
      showPumpingLosses: value,
    }),

  resetPVDiagrams: () =>
    set({
      selectedRPMs: [],
      selectedDiagramType: 'pv',
      showPumpingLosses: false,
    }),
});
