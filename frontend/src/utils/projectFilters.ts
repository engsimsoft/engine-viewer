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
    // Engine filter (Type + Intake combined)
    if (filters.type.length > 0) {
      // Separate engine types (NA, Turbo, Supercharged) from intake systems (ITB, IM)
      const engineTypes = filters.type.filter(t => ['NA', 'Turbo', 'Supercharged'].includes(t));
      const intakeSystems = filters.type.filter(t => ['ITB', 'IM'].includes(t));

      const projectType = project.metadata?.auto?.type;
      const projectIntake = project.metadata?.auto?.intakeSystem;

      // If intake systems selected: must be NA + matching intake
      if (intakeSystems.length > 0) {
        const matchesIntake = intakeSystems.includes(projectIntake as any);
        const isNA = projectType === 'NA';
        if (!matchesIntake || !isNA) {
          return false;
        }
      }

      // If engine types selected: must match type
      if (engineTypes.length > 0 && intakeSystems.length === 0) {
        if (!projectType || !engineTypes.includes(projectType as any)) {
          return false;
        }
      }
    }

    // Valves filter (2, 3, 4, 5)
    if (filters.valves.length > 0) {
      const projectValves = project.metadata?.auto?.valvesPerCylinder;
      if (!projectValves || !filters.valves.includes(projectValves)) {
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

    // Tags filter (OR logic: project must have at least one of selected tags)
    if (filters.tags.length > 0) {
      const projectTags = project.metadata?.manual?.tags || [];
      const hasMatchingTag = filters.tags.some(filterTag =>
        projectTags.includes(filterTag)
      );
      if (!hasMatchingTag) {
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

    case 'created':
      // Sort by created date (oldest first)
      return sorted.sort(
        (a, b) =>
          new Date(a.created).getTime() - new Date(b.created).getTime()
      );

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
