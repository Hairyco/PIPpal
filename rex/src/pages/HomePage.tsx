import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { PartnerLogos } from '../components/PartnerLogos';
import { LaunchCta } from '../components/LaunchCta';
import { StudioCarousel } from '../components/StudioCarousel';
import { IndustryGrid } from '../components/IndustryGrid';
import { Pillars } from '../components/Pillars';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <PartnerLogos />
      <LaunchCta />
      <StudioCarousel />
      <IndustryGrid />
      <Pillars />
    </Layout>
  );
}
