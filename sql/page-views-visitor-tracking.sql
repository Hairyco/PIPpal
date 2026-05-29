-- Run in Supabase SQL editor if anonymous visitor tracking fails to save.

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON page_views (visitor_id);

-- Allow anonymous and logged-in clients to insert visits (no public read).
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users (admin dashboard) can read for analytics.
DROP POLICY IF EXISTS "Authenticated can read page views" ON page_views;
CREATE POLICY "Authenticated can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can clear visitor stats from admin.
DROP POLICY IF EXISTS "Authenticated can delete page views" ON page_views;
CREATE POLICY "Authenticated can delete page views"
  ON page_views FOR DELETE
  TO authenticated
  USING (true);
