/**
 * Header Component - Analysis Page Header
 *
 * Phase 2 v3.0 - Generic Header with Breadcrumbs
 *
 * Layout:
 * [← Back]  [Title]  [PNG][SVG][Help][⚙️]
 * [Breadcrumbs] (optional, v3.0 feature)
 *
 * Features:
 * - Back button (configurable destination)
 * - Dynamic title (Performance, Traces, Config History, etc.)
 * - Optional breadcrumbs navigation (v3.0)
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
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  /** Page title (e.g., "Performance & Efficiency", "Traces", etc.) */
  title?: string;
  /** Back button destination (default: '/') */
  backHref?: string;
  /** Optional breadcrumbs navigation (v3.0 feature) */
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Header Component for Analysis Pages
 *
 * v3.0: Now accepts props for title, back navigation, and breadcrumbs.
 *
 * @example
 * ```tsx
 * <Header
 *   title="Performance & Efficiency"
 *   backHref="/project/vesta-16-im"
 *   breadcrumbs={[
 *     { label: 'Engine Viewer', href: '/' },
 *     { label: 'Vesta 1.6 IM', href: '/project/vesta-16-im' },
 *     { label: 'Performance & Efficiency' }
 *   ]}
 * />
 * ```
 */
export function Header({
  title = 'Performance & Efficiency',
  backHref = '/',
  breadcrumbs
}: HeaderProps = {}) {
  const navigate = useNavigate();
  const { exportPNG, exportSVG, isExportAvailable } = useChartExport();

  /**
   * Navigate back (to project overview or projects list)
   */
  const handleBackClick = () => {
    navigate(backHref);
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs (v3.0 - Level 3 pages only) */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-3">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Center: Page Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl font-bold text-foreground">
              {title}
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
