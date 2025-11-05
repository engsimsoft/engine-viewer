/**
 * Project Filtering and Sorting Utilities
 *
 * Client-side filtering logic for projects dashboard
 * Implements AND logic: all active filters must match
 */

import type { ProjectInfo } from '@/types';
import type { ProjectFiltersState } from '@/components/projects/FiltersBar';

/**
 * Filter projects based on active filters (AND logic)
 */
export function filterProjects(
  projects: ProjectInfo[],
  filters: ProjectFiltersState
): ProjectInfo[] {
  return projects.filter((project) => {
    // Type filter (NA, Turbo, Supercharged)
    if (filters.type.length > 0) {
      const projectType = project.metadata?.auto?.type;
      if (!projectType || !filters.type.includes(projectType)) {
        return false;
      }
    }

    // Intake filter (ITB, IM)
    if (filters.intake.length > 0) {
      const projectIntake = project.metadata?.auto?.intakeSystem;
      if (!projectIntake || !filters.intake.includes(projectIntake)) {
        return false;
      }
    }

    // Exhaust filter (4-2-1, 4-1, tri-y, etc.)
    if (filters.exhaust.length > 0) {
      const projectExhaust = project.metadata?.auto?.exhaustSystem;
      if (!projectExhaust || !filters.exhaust.includes(projectExhaust)) {
        return false;
      }
    }

    // Cylinders filter (1, 2, 3, 4, 5, 6, 8)
    if (filters.cylinders.length > 0) {
      const projectCylinders = project.metadata?.auto?.cylinders || project.numCylinders;
      if (!filters.cylinders.includes(projectCylinders)) {
        return false;
      }
    }

    // Search filter (displayName, client)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const displayName = (project.displayName || project.name).toLowerCase();
      const client = (project.metadata?.manual?.client || '').toLowerCase();

      if (!displayName.includes(searchLower) && !client.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort projects based on sort criteria
 */
export function sortProjects(
  projects: ProjectInfo[],
  sortBy: ProjectFiltersState['sortBy']
): ProjectInfo[] {
  const sorted = [...projects];

  switch (sortBy) {
    case 'date':
      // Sort by lastModified (newest first)
      return sorted.sort(
        (a, b) =>
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );

    case 'name':
      // Sort by name (A-Z)
      return sorted.sort((a, b) => {
        const nameA = (a.displayName || a.name).toLowerCase();
        const nameB = (b.displayName || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
      });

    case 'cylinders':
      // Sort by cylinders (descending)
      return sorted.sort((a, b) => {
        const cylA = a.metadata?.auto?.cylinders || a.numCylinders;
        const cylB = b.metadata?.auto?.cylinders || b.numCylinders;
        return cylB - cylA;
      });

    default:
      return sorted;
  }
}

/**
 * Filter and sort projects (combined operation)
 */
export function filterAndSortProjects(
  projects: ProjectInfo[],
  filters: ProjectFiltersState
): ProjectInfo[] {
  const filtered = filterProjects(projects, filters);
  return sortProjects(filtered, filters.sortBy);
}
