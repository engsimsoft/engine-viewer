/**
 * HelpPage Component - Parameters Documentation
 *
 * Displays comprehensive documentation for all 29 engine parameters.
 *
 * Features:
 * - Back button to return to visualization
 * - Search functionality for parameters
 * - Grouped by category (global, per-cylinder, vibe-model)
 * - Tooltips with full descriptions
 * - Dynamic units display (SI/American/HP)
 *
 * Related: docs/tasks/performance-efficiency-header-roadmap.md (Phase 2-7)
 */

import { useNavigate } from 'react-router-dom';
import { PARAMETERS } from '@/config/parameters';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Visualization</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Parameters Reference</h1>
          <p className="text-muted-foreground mt-2">
            Complete guide to all 29 engine parameters
          </p>
        </div>

        {/* Placeholder for parameters */}
        <div className="text-center py-12 text-muted-foreground">
          Parameters list will be implemented in Phase 3
        </div>
      </main>
    </div>
  );
}
