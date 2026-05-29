-- Reset all visitor stats (run in Supabase SQL editor).

DELETE FROM page_views;

-- Optional: also add delete policy if the admin Reset button fails with permission error:
-- DROP POLICY IF EXISTS "Authenticated can delete page views" ON page_views;
-- CREATE POLICY "Authenticated can delete page views"
--   ON page_views FOR DELETE
--   TO authenticated
--   USING (true);
