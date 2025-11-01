/**
 * Chart Export Context
 *
 * Provides a way for ChartPreset components to register their export handlers
 * and for the Header to access and trigger chart exports.
 *
 * Usage:
 * 1. Wrap app/page with ChartExportProvider
 * 2. ChartPreset components call registerExportHandlers() on mount
 * 3. Header uses exportPNG/exportSVG from context
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ExportHandlers {
  /** Handler to export chart as PNG */
  exportPNG: () => void;
  /** Handler to export chart as SVG */
  exportSVG: () => void;
}

interface ChartExportContextValue {
  /** Register export handlers from active chart */
  registerExportHandlers: (handlers: ExportHandlers) => void;
  /** Unregister export handlers */
  unregisterExportHandlers: () => void;
  /** Export current chart as PNG */
  exportPNG: () => void;
  /** Export current chart as SVG */
  exportSVG: () => void;
  /** Whether export is available (handlers registered) */
  isExportAvailable: boolean;
}

const ChartExportContext = createContext<ChartExportContextValue | undefined>(undefined);

interface ChartExportProviderProps {
  children: ReactNode;
}

/**
 * Provider for chart export functionality
 */
export function ChartExportProvider({ children }: ChartExportProviderProps) {
  const [handlers, setHandlers] = useState<ExportHandlers | null>(null);

  const registerExportHandlers = useCallback((newHandlers: ExportHandlers) => {
    setHandlers(newHandlers);
  }, []);

  const unregisterExportHandlers = useCallback(() => {
    setHandlers(null);
  }, []);

  const exportPNG = useCallback(() => {
    if (handlers?.exportPNG) {
      handlers.exportPNG();
    }
  }, [handlers]);

  const exportSVG = useCallback(() => {
    if (handlers?.exportSVG) {
      handlers.exportSVG();
    }
  }, [handlers]);

  const isExportAvailable = handlers !== null;

  return (
    <ChartExportContext.Provider
      value={{
        registerExportHandlers,
        unregisterExportHandlers,
        exportPNG,
        exportSVG,
        isExportAvailable,
      }}
    >
      {children}
    </ChartExportContext.Provider>
  );
}

/**
 * Hook to use chart export context
 */
export function useChartExport() {
  const context = useContext(ChartExportContext);
  if (context === undefined) {
    throw new Error('useChartExport must be used within ChartExportProvider');
  }
  return context;
}
