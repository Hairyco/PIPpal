import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { BecomeSupplierPage } from './pages/BecomeSupplierPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/become-a-supplier" element={<BecomeSupplierPage />} />
      </Routes>
    </BrowserRouter>
  );
}
