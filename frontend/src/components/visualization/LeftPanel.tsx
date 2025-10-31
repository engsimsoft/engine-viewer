/**
 * Left Panel Component - Main Control Panel for Visualization
 *
 * Phase 2 - Section 2.3
 *
 * Layout (3 sections):
 * ┌─────────────────────┐
 * │ Primary Calculation │ <-- PrimarySection component (Section 2.4)
 * ├─────────────────────┤
 * │ Chart Presets       │ <-- PresetSelector (existing)
 * ├─────────────────────┤
 * │ Compare With (X/4)  │ <-- ComparisonSection component (Section 2.6)
 * └─────────────────────┘
 *
 * Responsive Behavior:
 * - Desktop (>1024px): Fixed width 320px, always visible
 * - Tablet (768-1024px): Collapsible with hamburger menu
 * - Mobile (<768px): Full-screen overlay when open
 */

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PresetSelector } from './PresetSelector';
import { PrimarySection } from './PrimarySection';
import { cn } from '@/lib/utils';

// ====================================================================
// Placeholder Components (will be implemented in later sections)
// ====================================================================

/**
 * Comparison Section Placeholder
 * TODO: Implement in Section 2.6
 */
function ComparisonSectionPlaceholder() {
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
        Compare With (0/4)
      </h3>
      <p className="text-xs text-muted-foreground">
        Will be implemented in Section 2.6
      </p>
    </div>
  );
}

// ====================================================================
// Main Component
// ====================================================================

/**
 * Left Panel - Main Control Panel for Visualization
 *
 * Contains three sections:
 * 1. Primary Calculation selector (Section 2.4 - PrimarySection)
 * 2. Chart Presets selector (Section 2.5 - PresetSelector)
 * 3. Comparison calculations (Section 2.6 - ComparisonSection)
 *
 * All sections connected to Zustand store - no props needed.
 *
 * Responsive behavior:
 * - Desktop (lg): Always visible, fixed 320px width
 * - Tablet (md-lg): Collapsible with hamburger menu
 * - Mobile (sm): Full-screen overlay when open
 *
 * @example
 * ```tsx
 * <LeftPanel />
 * ```
 */
export function LeftPanel() {
  // State for tablet/mobile collapsed state
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggle panel open/closed (tablet/mobile only)
   */
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Close panel (used after selection on mobile)
   */
  const closePanel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button (Tablet/Mobile only) */}
      <Button
        variant="outline"
        size="icon"
        onClick={togglePanel}
        className={cn(
          'fixed top-20 left-4 z-50 shadow-lg',
          'lg:hidden', // Hide on desktop (>1024px)
          isOpen && 'hidden' // Hide when panel is open
        )}
        aria-label="Toggle left panel"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay (Mobile/Tablet - when open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closePanel}
          aria-hidden="true"
        />
      )}

      {/* Left Panel */}
      <aside
        className={cn(
          // Base styles
          'bg-background border-r flex flex-col overflow-y-auto',

          // Desktop (>1024px): Always visible, fixed width
          'lg:static lg:w-80 lg:h-full',

          // Tablet/Mobile (<1024px): Overlay behavior
          'fixed top-0 left-0 h-full z-50',
          'transition-transform duration-300 ease-in-out',

          // Mobile (<768px): Full screen width
          'w-full',

          // Tablet (768-1024px): Partial width
          'md:w-96',

          // Transform based on open state (tablet/mobile only)
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close Button (Tablet/Mobile only) */}
        <div className="lg:hidden flex justify-end p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={closePanel}
            aria-label="Close left panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Panel Content - 3 Sections */}
        <div className="flex-1 flex flex-col gap-4 p-4">
          {/* Section 1: Primary Calculation */}
          <section aria-label="Primary calculation selector">
            <PrimarySection />
          </section>

          {/* Section 2: Chart Presets */}
          <section aria-label="Chart presets selector">
            <PresetSelector />
          </section>

          {/* Section 3: Comparison Calculations */}
          <section aria-label="Comparison calculations">
            <ComparisonSectionPlaceholder />
          </section>
        </div>
      </aside>
    </>
  );
}

export default LeftPanel;
