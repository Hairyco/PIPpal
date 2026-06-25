import { Link } from 'react-router-dom';
import { Layout, BackLink } from '../components/Layout';
import { IndustryGrid } from '../components/IndustryGrid';

export function CategoriesPage() {
  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />
        <IndustryGrid showAll />
      </div>
    </Layout>
  );
}
