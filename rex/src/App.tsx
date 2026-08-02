import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './components/AuthProvider';
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
import { FeesPage } from './pages/FeesPage';
import { MarketingWalletPage } from './pages/MarketingWalletPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { CoinPage } from './pages/CoinPage';
import { WelcomeGate } from './components/WelcomeGate';

export function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <ScrollToTop />
          <WelcomeGate />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/coin/:ticker" element={<CoinPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/launch" element={<LaunchCtoPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/advertise" element={<ServicesPage />} />
            <Route path="/services" element={<Navigate to="/advertise" replace />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/marketing-wallet" element={<MarketingWalletPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
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
          <AuthModal />
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}
