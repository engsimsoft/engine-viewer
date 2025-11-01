import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ProjectPage from '@/pages/ProjectPage';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from '@/stores/appStore';
import './App.css';

/**
 * Main App Component - Routing Configuration
 *
 * v2.0 Routing Architecture:
 * - Route 1: `/` - HomePage (project list)
 * - Route 2: `/project/:id` - ProjectPage (visualization with cross-project comparison)
 *
 * IMPORTANT:
 * - projectId in URL (:id) serves as INITIAL CONTEXT for visualization
 * - User can compare calculations from ANY project (cross-project comparison)
 * - See docs/routing.md for full architecture details
 *
 * Phase 1: Routing structure defined and ready ✅
 * Phase 2: ProjectPage will be updated to use Zustand store + useMultiProjectData
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
      <Routes>
        {/* Home page - project list */}
        <Route path="/" element={<HomePage />} />

        {/* Visualization page - cross-project comparison support */}
        {/* :id = initial project context (NOT a restriction) */}
        <Route path="/project/:id" element={<ProjectPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
