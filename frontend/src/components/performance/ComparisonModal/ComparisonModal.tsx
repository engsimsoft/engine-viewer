/**
 * Comparison Selection Modal - Wrapper Component
 *
 * Phase 3 - Section 3.4
 *
 * 2-step modal for selecting calculations to add to comparison:
 * - Step 1: Select project from all available projects
 * - Step 2: Select calculation from selected project
 *
 * Manages modal state (step, selectedProject) and transitions.
 *
 * Connected to Zustand store:
 * - isComparisonModalOpen: boolean
 * - toggleComparisonModal: () => void
 * - addComparison: (calc: CalculationReference) => void
 *
 * @example
 * ```tsx
 * <ComparisonModal />
 * ```
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/stores/appStore';
import { ProjectListStep } from './ProjectListStep';
import { CalculationListStep } from './CalculationListStep';
import type { ProjectInfo } from '@/types';

interface ComparisonModalProps {
  /** Current project ID (from URL) - used to prioritize current project in list */
  currentProjectId?: string;
}

/**
 * Comparison Selection Modal Component
 *
 * Two-step modal:
 * 1. Project selection (ProjectListStep)
 * 2. Calculation selection (CalculationListStep)
 *
 * @param currentProjectId - ID of currently open project (shown first in list)
 */
export function ComparisonModal({ currentProjectId }: ComparisonModalProps) {
  // Zustand store - modal open state
  const isComparisonModalOpen = useAppStore(
    (state) => state.isComparisonModalOpen
  );
  const toggleComparisonModal = useAppStore(
    (state) => state.toggleComparisonModal
  );

  // Local state - step and selected project
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(
    null
  );

  /**
   * Reset state when modal is closed
   */
  useEffect(() => {
    if (!isComparisonModalOpen) {
      // Reset to Step 1 and clear selected project when modal closes
      setStep(1);
      setSelectedProject(null);
    }
  }, [isComparisonModalOpen]);

  /**
   * Handle project selection (Step 1 → Step 2)
   */
  const handleSelectProject = (project: ProjectInfo) => {
    setSelectedProject(project);
    setStep(2);
  };

  /**
   * Handle back button (Step 2 → Step 1)
   */
  const handleBack = () => {
    setStep(1);
    setSelectedProject(null);
  };

  /**
   * Handle calculation added (close modal)
   */
  const handleAdd = () => {
    toggleComparisonModal();
    // Reset will happen in useEffect when modal closes
  };

  return (
    <Dialog open={isComparisonModalOpen} onOpenChange={toggleComparisonModal}>
      <DialogContent className="sm:max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Add for Comparison</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Select a project' : 'Select a calculation to compare'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Project List */}
        {step === 1 && (
          <ProjectListStep
            onSelectProject={handleSelectProject}
            currentProjectId={currentProjectId}
          />
        )}

        {/* Step 2: Calculation List */}
        {step === 2 && selectedProject && (
          <CalculationListStep
            selectedProject={selectedProject}
            onBack={handleBack}
            onAdd={handleAdd}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ComparisonModal;
