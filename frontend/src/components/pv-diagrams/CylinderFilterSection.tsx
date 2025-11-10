/**
 * Cylinder Filter Section Component - Cylinder Selector
 *
 * PV-Diagrams - Section 2
 *
 * Features:
 * - Dynamic buttons: "All" + "Cyl 1" ... "Cyl N"
 * - Grid layout: 4 columns for compact display
 * - Cylinder color preview dots
 * - Active state styling
 * - Integration with Zustand store (selectedCylinder)
 */

import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

/**
 * Cylinder color palette (8 colors for 8-cylinder engines)
 * High-contrast colors for visibility
 *
 * Matches PVDiagramChart.tsx colors
 */
const CYLINDER_COLORS = [
  '#e74c3c',  // Cylinder 1 - Red
  '#3498db',  // Cylinder 2 - Blue
  '#2ecc71',  // Cylinder 3 - Green
  '#f39c12',  // Cylinder 4 - Orange
  '#9b59b6',  // Cylinder 5 - Purple
  '#1abc9c',  // Cylinder 6 - Turquoise
  '#e67e22',  // Cylinder 7 - Carrot
  '#34495e',  // Cylinder 8 - Dark Gray
];

interface CylinderFilterSectionProps {
  /** Number of cylinders in the selected file */
  numCylinders: number;
}

/**
 * Cylinder Filter Section Component
 *
 * Allows switching between viewing all cylinders or a specific cylinder.
 * Dynamically generates buttons based on the number of cylinders.
 *
 * @example
 * ```tsx
 * <CylinderFilterSection numCylinders={4} />
 * ```
 */
export function CylinderFilterSection({ numCylinders }: CylinderFilterSectionProps) {
  const selectedCylinder = useAppStore((state) => state.selectedCylinder);
  const setSelectedCylinder = useAppStore((state) => state.setSelectedCylinder);

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Cylinder Filter
        </h3>
      </div>

      {/* Cylinder Buttons Grid (4 columns) */}
      <div className="grid grid-cols-4 gap-2">
        {/* "All" Button */}
        <button
          onClick={() => setSelectedCylinder(null)}
          className={cn(
            'flex items-center justify-center px-2.5 py-2 rounded-md border transition-all',
            'hover:shadow-sm active:scale-[0.98]',
            selectedCylinder === null
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-background border-border hover:border-primary/50 hover:bg-accent/50'
          )}
          aria-label="Show all cylinders"
          aria-pressed={selectedCylinder === null}
        >
          <span className="font-semibold text-xs">All</span>
        </button>

        {/* Individual Cylinder Buttons */}
        {Array.from({ length: numCylinders }, (_, i) => {
          const cylinderIndex = i;
          const cylinderNum = i + 1;
          const isActive = selectedCylinder === cylinderIndex;
          const color = CYLINDER_COLORS[cylinderIndex % CYLINDER_COLORS.length];

          return (
            <button
              key={cylinderIndex}
              onClick={() => setSelectedCylinder(cylinderIndex)}
              className={cn(
                'flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border transition-all',
                'hover:shadow-sm active:scale-[0.98]',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background border-border hover:border-primary/50 hover:bg-accent/50'
              )}
              aria-label={`Show cylinder ${cylinderNum}`}
              aria-pressed={isActive}
            >
              {/* Color Dot */}
              <div
                className="w-2 h-2 rounded-full border border-border"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {/* Cylinder Number */}
              <span className="font-semibold text-xs">Cyl {cylinderNum}</span>
            </button>
          );
        })}
      </div>

      {/* Info Text */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        {selectedCylinder === null
          ? `Showing all ${numCylinders} cylinders`
          : `Showing cylinder ${selectedCylinder + 1} of ${numCylinders}`}
      </div>
    </div>
  );
}

export default CylinderFilterSection;
