import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { BecomeSupplierPage } from './pages/BecomeSupplierPage';
import { ProjectPage } from './pages/ProjectPage';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/project/:categoryId/:projectId" element={<ProjectPage />} />
        <Route path="/become-a-supplier" element={<BecomeSupplierPage />} />
      </Routes>
    </BrowserRouter>
  );
}
