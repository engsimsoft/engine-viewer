import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ProjectPage from '@/pages/ProjectPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
