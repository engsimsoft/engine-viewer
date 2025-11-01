/**
 * Header Component - Visualization Page Header
 *
 * Phase 2 - Section 2.1
 *
 * Layout:
 * [← Back to Projects]  [Project Name + Metadata]  [⚙️ Settings]
 *
 * Features:
 * - Back button to navigate to projects list
 * - Project name and metadata display (engine type, cylinders, calculations count)
 * - Settings icon button to open Settings popover
 * - Responsive layout
 */

import { ArrowLeft, Settings, Download, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SettingsPopover } from './SettingsPopover';
import { useChartExport } from '@/contexts/ChartExportContext';

interface HeaderProps {
  /** Project name to display (e.g., "Vesta 1.6 IM") */
  projectName: string;
  /** Engine type (e.g., "NATUR", "TURBO") */
  engineType: string;
  /** Number of cylinders (e.g., 4, 6, 8) */
  cylinders: number;
  /** Number of calculations in the project */
  calculationsCount: number;
}

/**
 * Header Component for Visualization Page
 *
 * Displays project information and navigation controls.
 *
 * @example
 * ```tsx
 * <Header
 *   projectName="Vesta 1.6 IM"
 *   engineType="NATUR"
 *   cylinders={4}
 *   calculationsCount={17}
 * />
 * ```
 */
export function Header({
  projectName,
  engineType,
  cylinders,
  calculationsCount,
}: HeaderProps) {
  const navigate = useNavigate();
  const { exportPNG, exportSVG, isExportAvailable } = useChartExport();

  /**
   * Navigate back to projects list
   */
  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Projects</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          {/* Center: Project Name + Metadata */}
          <div className="flex-1 text-center px-4">
            {/* Project Name */}
            <h1 className="text-xl font-bold text-foreground">
              {projectName}.det
            </h1>

            {/* Metadata Line */}
            <div className="flex items-center justify-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{engineType}</span>
              <span>•</span>
              <span>{cylinders} cylinders</span>
              <span>•</span>
              <span>{calculationsCount} calculations</span>
            </div>
          </div>

          {/* Right: Export Buttons + Settings */}
          <div className="flex items-center gap-2">
            {/* PNG Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportPNG}
              disabled={!isExportAvailable}
              title="Export to PNG (raster format for presentations)"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span>PNG</span>
            </Button>

            {/* SVG Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportSVG}
              disabled={!isExportAvailable}
              title="Export to SVG (vector format for publications)"
              className="gap-2"
            >
              <FileImage className="h-4 w-4" />
              <span>SVG</span>
            </Button>

            {/* Settings Button */}
            <SettingsPopover>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </SettingsPopover>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
