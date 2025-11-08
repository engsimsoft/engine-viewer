/**
 * Deep Linking Hook - URL Params ↔ Store State Synchronization
 *
 * v3.0: HIGH PRIORITY Feature
 *
 * Keeps URL params synchronized with Zustand store state for:
 * - Chart preset selection (preset=1-6)
 * - Primary calculation (primary=projectId:calculationId)
 * - Comparison calculations (compare=projectId1:calcId1,projectId2:calcId2,...)
 *
 * URL Format Examples:
 * - `/project/vesta-16-im/performance?preset=1&primary=$1`
 * - `/project/vesta-16-im/performance?preset=4&primary=$1&compare=$2,$5`
 * - `/project/bmw-m42/performance?preset=2&primary=$3&compare=vesta-16-im:$1`
 *
 * Features:
 * - Browser Back/Forward support (URL changes → store updates)
 * - Shareable URLs (copy URL → share → same visualization state)
 * - Auto-fetch calculation data when restoring from URL
 *
 * Usage:
 * ```tsx
 * function PerformancePage() {
 *   const { id: projectId } = useParams();
 *   useDeepLinking(projectId!);
 *   // ... rest of component
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import type { CalculationReference } from '../types/v2';

/**
 * Parse calculation reference from URL param format
 *
 * Format: "projectId:calculationId" or just "calculationId" (uses current project)
 *
 * @param param - URL param value (e.g., "$1" or "bmw-m42:$5")
 * @param defaultProjectId - Default project ID if not specified in param
 * @returns Partial CalculationReference (projectId, calculationId only)
 *
 * Note: Full calculation data will be fetched by the caller using API
 */
function parseCalculationParam(
  param: string,
  defaultProjectId: string
): { projectId: string; calculationId: string } | null {
  if (!param) return null;

  // Format: "projectId:calculationId" or "$calculationId"
  const parts = param.split(':');

  if (parts.length === 2) {
    // Cross-project reference: "bmw-m42:$5"
    return {
      projectId: parts[0],
      calculationId: parts[1],
    };
  } else if (parts.length === 1) {
    // Same-project reference: "$1"
    return {
      projectId: defaultProjectId,
      calculationId: parts[0],
    };
  }

  return null;
}

/**
 * Serialize calculation reference to URL param format
 *
 * @param calc - Calculation reference
 * @param currentProjectId - Current project context
 * @returns URL param value (e.g., "$1" or "bmw-m42:$5")
 */
function serializeCalculation(
  calc: CalculationReference,
  currentProjectId: string
): string {
  // Same project → short format: "$1"
  if (calc.projectId === currentProjectId) {
    return calc.calculationId;
  }
  // Cross-project → full format: "bmw-m42:$5"
  return `${calc.projectId}:${calc.calculationId}`;
}

/**
 * Fetch calculation metadata from API
 *
 * Uses /api/project/:id endpoint and extracts specific calculation data
 *
 * @param projectId - Project ID
 * @param calculationId - Calculation ID
 * @returns Full CalculationReference with metadata
 */
async function fetchCalculationMetadata(
  projectId: string,
  calculationId: string
): Promise<CalculationReference | null> {
  try {
    // Fetch full project data
    const response = await fetch(`/api/project/${projectId}`);
    if (!response.ok) {
      console.error(`Failed to fetch project ${projectId}`);
      return null;
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      console.error(`Invalid response for project ${projectId}`);
      return null;
    }

    const projectData = result.data;

    // Find specific calculation
    const calculation = projectData.calculations.find(
      (calc: any) => calc.id === calculationId
    );

    if (!calculation) {
      console.error(`Calculation ${calculationId} not found in project ${projectId}`);
      return null;
    }

    // Calculate avg RPM step
    const rpms = calculation.dataPoints?.map((dp: any) => dp.RPM) || [];
    const steps = rpms.slice(1).map((rpm: number, i: number) => rpm - rpms[i]);
    const avgStep = steps.length > 0
      ? Math.round(steps.reduce((sum: number, step: number) => sum + step, 0) / steps.length)
      : 0;

    // Build CalculationReference
    // Note: color will be assigned by store actions
    return {
      projectId,
      projectName: projectData.name || projectId,
      calculationId,
      calculationName: calculation.name || calculationId,
      color: '#000000', // Placeholder, will be assigned by store
      metadata: {
        rpmRange: [
          calculation.metadata?.rpmRange?.min || 0,
          calculation.metadata?.rpmRange?.max || 0
        ],
        avgStep,
        pointsCount: calculation.dataPoints?.length || 0,
        engineType: projectData.metadata?.engineType || 'NATUR',
        cylinders: projectData.metadata?.numCylinders || 4,
      },
    };
  } catch (error) {
    console.error(`Error fetching calculation ${projectId}:${calculationId}:`, error);
    return null;
  }
}

/**
 * Deep Linking Hook
 *
 * Synchronizes URL params with Zustand store state.
 *
 * @param projectId - Current project ID (from route params)
 */
export function useDeepLinking(projectId: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Store state
  const preset = useAppStore((state) => state.selectedPreset);
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);
  const comparisonCalculations = useAppStore((state) => state.comparisonCalculations);

  // Store actions
  const setSelectedPreset = useAppStore((state) => state.setSelectedPreset);
  const setPrimaryCalculation = useAppStore((state) => state.setPrimaryCalculation);
  const clearPrimaryCalculation = useAppStore((state) => state.clearPrimaryCalculation);
  const addComparison = useAppStore((state) => state.addComparison);
  const clearComparisons = useAppStore((state) => state.clearComparisons);

  // Track if we're currently syncing URL → Store to prevent Store → URL from triggering
  const isSyncingFromURLRef = useRef(false);

  // ============================================================
  // URL → Store (on mount & browser Back/Forward)
  // ============================================================

  useEffect(() => {
    const syncFromURL = async () => {
      isSyncingFromURLRef.current = true;

      // Read URL params
      const presetParam = searchParams.get('preset');
      const primaryParam = searchParams.get('primary');
      const compareParam = searchParams.get('compare');

      // Sync preset
      if (presetParam) {
        const presetValue = parseInt(presetParam, 10) as 1 | 2 | 3 | 4 | 5 | 6;
        if (presetValue >= 1 && presetValue <= 6 && presetValue !== preset) {
          setSelectedPreset(presetValue);
        }
      }

      // Sync primary calculation
      if (primaryParam) {
        const parsed = parseCalculationParam(primaryParam, projectId);
        if (parsed) {
          // Check if already loaded
          if (
            !primaryCalculation ||
            primaryCalculation.projectId !== parsed.projectId ||
            primaryCalculation.calculationId !== parsed.calculationId
          ) {
            // Fetch calculation metadata
            const calcRef = await fetchCalculationMetadata(
              parsed.projectId,
              parsed.calculationId
            );
            if (calcRef) {
              setPrimaryCalculation(calcRef);
            }
          }
        }
      }
      // Note: Don't clear store if URL empty - Store → URL will sync URL to match store

      // Sync comparison calculations
      if (compareParam) {
        const compareIds = compareParam.split(',').map((p) => p.trim()).filter(Boolean);
        const parsedComparisons = compareIds
          .map((id) => parseCalculationParam(id, projectId))
          .filter(Boolean) as { projectId: string; calculationId: string }[];

        // Clear existing comparisons
        clearComparisons();

        // Fetch and add new comparisons
        for (const parsed of parsedComparisons) {
          const calcRef = await fetchCalculationMetadata(
            parsed.projectId,
            parsed.calculationId
          );
          if (calcRef) {
            addComparison(calcRef);
          }
        }
      }
      // Note: Don't clear comparisons if URL empty - Store → URL will sync URL to match store

      isSyncingFromURLRef.current = false;
    };

    syncFromURL();
  }, [searchParams]); // Re-run when URL changes (browser Back/Forward)

  // ============================================================
  // Store → URL (when store state changes)
  // ============================================================

  useEffect(() => {
    // Skip if we're currently syncing URL → Store (prevent infinite loop)
    if (isSyncingFromURLRef.current) return;

    const params = new URLSearchParams();

    // Sync preset
    if (preset) {
      params.set('preset', preset.toString());
    }

    // Sync primary calculation
    if (primaryCalculation) {
      params.set('primary', serializeCalculation(primaryCalculation, projectId));
    }

    // Sync comparison calculations
    if (comparisonCalculations.length > 0) {
      const compareParam = comparisonCalculations
        .map((calc) => serializeCalculation(calc, projectId))
        .join(',');
      params.set('compare', compareParam);
    }

    // Update URL (without triggering navigation)
    // replace: true → updates URL without adding to browser history
    setSearchParams(params, { replace: true });
  }, [preset, primaryCalculation, comparisonCalculations, projectId, setSearchParams]);
}
