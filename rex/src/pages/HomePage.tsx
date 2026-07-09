import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { BuildCategoryPills } from '../components/BuildCategoryPills';
import { HowItWorksTimeline } from '../components/HowItWorksTimeline';
import { StudioCarousel } from '../components/StudioCarousel';
import { IndustryGrid } from '../components/IndustryGrid';
import { MarketplaceSection } from '../components/MarketplaceSection';
import { GrowSection } from '../components/GrowSection';
import { LaunchCta } from '../components/LaunchCta';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <BuildCategoryPills />
      <HowItWorksTimeline />
      <StudioCarousel />
      <IndustryGrid />
      <MarketplaceSection />
      <GrowSection />
      <LaunchCta />
    </Layout>
  );
}
