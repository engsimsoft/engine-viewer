/**
 * Header Component - Visualization Page Header
 *
 * Phase 2 - Section 2.1 (Updated: Performance & Efficiency Header)
 *
 * Layout:
 * [← Back to Projects]  [Performance & Efficiency]  [PNG][SVG][Help][⚙️]
 *
 * Features:
 * - Back button to navigate to projects list
 * - Static "Performance & Efficiency" title
 * - Export buttons (PNG, SVG)
 * - Help button to navigate to /help page
 * - Settings popover
 * - Responsive layout
 */

import { ArrowLeft, Settings, Download, FileImage, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SettingsPopover } from './SettingsPopover';
import { useChartExport } from '@/contexts/ChartExportContext';

/**
 * Header Component for Visualization Page
 *
 * Displays static "Performance & Efficiency" title with navigation and export controls.
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
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

          {/* Center: Static Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl font-bold text-foreground">
              Performance & Efficiency
            </h1>
          </div>

          {/* Right: Export Buttons + Help + Settings */}
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
              <span className="hidden sm:inline">PNG</span>
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
              <span className="hidden sm:inline">SVG</span>
            </Button>

            {/* Help Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/help')}
              title="View parameters documentation"
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>

            {/* Settings Button */}
            <SettingsPopover>
              <Button
                variant="ghost"
                size="icon-sm"
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
