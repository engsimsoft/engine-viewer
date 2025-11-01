/**
 * Project List Step - Comparison Modal Step 1
 *
 * Phase 3 - Section 3.2
 *
 * First step of the 2-step Comparison Selection Modal.
 * Shows list of available projects with metadata.
 *
 * Features:
 * - Search projects by name (case-insensitive)
 * - Project cards with metadata (calculations count, engine type, cylinders, last modified)
 * - Click on project → advance to Step 2
 * - Loading/error/empty states
 */

import { useState, useMemo } from 'react';
import { Search, X, FolderOpen, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectInfo } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectListStepProps {
  /** Callback when project is selected */
  onSelectProject: (project: ProjectInfo) => void;
  /** Current project ID - shown first in the list */
  currentProjectId?: string;
}

/**
 * Project List Step Component
 *
 * Step 1 of Comparison Selection Modal.
 * Displays list of all available projects with search functionality.
 * Current project (if provided) is shown first in the list.
 *
 * @param onSelectProject - Callback when user clicks on a project card
 * @param currentProjectId - ID of currently open project (prioritized in list)
 */
export function ProjectListStep({
  onSelectProject,
  currentProjectId,
}: ProjectListStepProps) {
  // Fetch projects list
  const { projects, loading, error } = useProjects();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filter and sort projects
   * - Filter by search query (case-insensitive)
   * - Sort: current project first, then alphabetically
   */
  const filteredProjects = useMemo(() => {
    // Filter by search query
    let filtered = projects;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = projects.filter((project) =>
        project.name.toLowerCase().includes(query)
      );
    }

    // Sort: current project first, then others
    if (currentProjectId) {
      return filtered.sort((a, b) => {
        // Current project always first
        if (a.id === currentProjectId) return -1;
        if (b.id === currentProjectId) return 1;
        // Others: alphabetically
        return a.name.localeCompare(b.name);
      });
    }

    return filtered;
  }, [projects, searchQuery, currentProjectId]);

  /**
   * Format last modified date to readable format
   */
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Step Header */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">
          Step 1 of 2
        </h3>
        <h2 className="text-lg font-semibold">Select Project</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          <p>Loading projects...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">Error: {error}</p>
        </div>
      )}

      {/* Project List */}
      {!loading && !error && (
        <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">
                {searchQuery
                  ? 'No projects found matching your search'
                  : 'No projects available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={cn(
                    'w-full p-4 rounded-lg border transition-all text-left',
                    'hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm',
                    'group'
                  )}
                  aria-label={`Select ${project.name}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Folder Icon */}
                    <FolderOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      {/* Project Name */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {project.name}
                        </p>
                        {project.id === currentProjectId && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Current Project
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      {/* Metadata Line 1: Calculations, Engine Type, Cylinders */}
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {project.calculationsCount} calc
                        {project.calculationsCount === 1 ? '' : 's'} •{' '}
                        {project.engineType} • {project.numCylinders} cyl
                        {project.numCylinders === 1 ? '' : 's'}
                      </p>

                      {/* Metadata Line 2: Last Modified */}
                      <p className="text-xs text-muted-foreground">
                        Last: {formatDate(project.lastModified)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectListStep;
