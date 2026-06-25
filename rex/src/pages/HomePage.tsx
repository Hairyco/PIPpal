import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { Pillars } from '../components/Pillars';
import { StudioCarousel } from '../components/StudioCarousel';
import { IndustryGrid } from '../components/IndustryGrid';
import { MarketplaceSection } from '../components/MarketplaceSection';
import { GrowSection } from '../components/GrowSection';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <Pillars />
      <StudioCarousel />
      <IndustryGrid />
      <MarketplaceSection />
      <GrowSection />
      <LaunchCta />
    </Layout>
  );
}
