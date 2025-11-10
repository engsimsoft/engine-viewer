/**
 * PV-Diagrams Slice - RPM & Cylinder Selection
 *
 * v3.0: Session-only state for PV-Diagrams page
 *
 * Manages user selections for PV-Diagram visualization:
 * - Selected RPM file (.pvd file selection)
 * - Cylinder filter (All or specific cylinder index)
 * - Diagram type (P-V, Log P-V, P-α)
 *
 * PERSISTED: No (session-only, resets on page reload)
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
  selectedRPM: string | null;       // Selected .pvd file name (e.g., "V8_2000.pvd")
  selectedCylinder: number | null;  // Selected cylinder (null = All, 0-7 = specific)
  selectedDiagramType: DiagramType; // Diagram type (default: 'pv')

  // Actions
  setSelectedRPM: (rpm: string | null) => void;
  setSelectedCylinder: (cylinder: number | null) => void;
  setSelectedDiagramType: (type: DiagramType) => void;
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

  selectedRPM: null,
  selectedCylinder: null, // null = "All" cylinders
  selectedDiagramType: 'pv', // Default: Normal P-V Diagram

  // ============================================================
  // Actions
  // ============================================================

  setSelectedRPM: (rpm) =>
    set({
      selectedRPM: rpm,
    }),

  setSelectedCylinder: (cylinder) =>
    set({
      selectedCylinder: cylinder,
    }),

  setSelectedDiagramType: (type) =>
    set({
      selectedDiagramType: type,
    }),

  resetPVDiagrams: () =>
    set({
      selectedRPM: null,
      selectedCylinder: null,
      selectedDiagramType: 'pv',
    }),
});
