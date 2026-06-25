import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { Pillars } from '../components/Pillars';
import { StudioCarousel } from '../components/StudioCarousel';
import { IndustryGrid } from '../components/IndustryGrid';
import { MarketplaceSection } from '../components/MarketplaceSection';
import { LaunchCta } from '../components/LaunchCta';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <Pillars />
      <StudioCarousel />
      <IndustryGrid />
      <MarketplaceSection />
      <LaunchCta />
    </Layout>
  );
}
