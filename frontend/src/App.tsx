import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ProjectOverviewPage from '@/pages/ProjectOverviewPage';
import ProjectPage from '@/pages/ProjectPage';
import HelpPage from '@/pages/HelpPage';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from '@/stores/appStore';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import './App.css';

/**
 * Main App Component - Routing Configuration
 *
 * v3.0 Routing Architecture (3-Level Hierarchy):
 * - Route 1: `/` - HomePage (project list)
 * - Route 2: `/project/:id` - ProjectOverviewPage (analysis type selection HUB)
 * - Route 3: `/project/:id/performance` - ProjectPage (Performance & Efficiency)
 * - Route 4: `/help` - HelpPage (parameters documentation)
 *
 * BREAKING CHANGE (v2.0 → v3.0):
 * - `/project/:id` now shows Project Overview (was: Performance page directly)
 * - Performance page moved to `/project/:id/performance`
 *
 * User Journey:
 * 1. HomePage → select project
 * 2. ProjectOverviewPage → select analysis type (Performance, Traces, etc.)
 * 3. Analysis Page → view charts and data
 *
 * Shortcuts:
 * - HomePage "Open Project" button → `/project/:id/performance` (direct to charts)
 * - HomePage "⋮" menu → `/project/:id` (Project Overview)
 *
 * v3.0 Features:
 * - Project Overview as central hub ✅
 * - Multiple analysis types support (Performance, Traces, Config History)
 * - Cross-project comparison still works (Zustand store + useMultiProjectData)
 */
function App() {
  // Apply theme to document root
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Home page - project list */}
          <Route path="/" element={<HomePage />} />

          {/* Project Overview - central hub for analysis type selection */}
          <Route path="/project/:id" element={<ProjectOverviewPage />} />

          {/* Performance & Efficiency - visualization page */}
          {/* :id = initial project context (cross-project comparison supported) */}
          <Route path="/project/:id/performance" element={<ProjectPage />} />

          {/* Help page - parameters documentation */}
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        <Toaster />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
