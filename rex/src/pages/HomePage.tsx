import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { LaunchCta } from '../components/LaunchCta';
import { StudioCarousel } from '../components/StudioCarousel';
import { IndustryGrid } from '../components/IndustryGrid';
import { MarketplaceSection } from '../components/MarketplaceSection';
import { Pillars } from '../components/Pillars';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <LaunchCta />
      <StudioCarousel />
      <MarketplaceSection />
      <IndustryGrid />
      <Pillars />
    </Layout>
  );
}
