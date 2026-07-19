import { Layout } from '../../components/Layout';
import { Hero } from '../../components/Hero';
import { BuildCategoryPills } from '../../components/BuildCategoryPills';
import { RexJourneySection } from '../../components/RexJourneySection';
import { HowItWorksTimeline } from '../../components/HowItWorksTimeline';
import { StudioCarousel } from '../../components/StudioCarousel';
import { IndustryGrid } from '../../components/IndustryGrid';
import { MarketplaceSection } from '../../components/MarketplaceSection';
import { GrowSection } from '../../components/GrowSection';
import { LaunchCta } from '../../components/LaunchCta';

/**
 * Archived July 2026 product-incubator landing page.
 * Kept intact while Rex pivots to community takeover relaunches.
 */
export function LegacyHomePage() {
  return (
    <Layout>
      <Hero />
      <BuildCategoryPills />
      <RexJourneySection />
      <HowItWorksTimeline />
      <StudioCarousel />
      <IndustryGrid />
      <MarketplaceSection />
      <GrowSection />
      <LaunchCta />
    </Layout>
  );
}
