import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { WalletProvider } from './components/ConnectWalletButton';
import { HomePage } from './pages/HomePage';
import { LaunchCtoPage } from './pages/LaunchCtoPage';
import { CategoryPage } from './pages/CategoryPage';
import { BecomeSupplierPage } from './pages/BecomeSupplierPage';
import { ProjectPage } from './pages/ProjectPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { PromotePage } from './pages/PromotePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AffiliatesCataloguePage } from './pages/AffiliatesCataloguePage';
import { FounderDashboardPage } from './pages/FounderDashboardPage';
import { TradePage } from './pages/TradePage';
import { ServicesPage } from './pages/ServicesPage';

export function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/launch" element={<LaunchCtoPage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/project/:categoryId/:projectId" element={<ProjectPage />} />
          <Route path="/project/:categoryId/:projectId/promote" element={<PromotePage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/dashboard" element={<FounderDashboardPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/affiliates" element={<AffiliatesCataloguePage />} />
          <Route path="/become-a-supplier" element={<BecomeSupplierPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}
