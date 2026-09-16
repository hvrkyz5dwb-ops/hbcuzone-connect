-- Two conflicting CHECK constraints existed on listings.kind: one allowed
-- ('item','service','booking'), the other ('product','service'). Their
-- intersection was 'service' only, so no product listing could ever be saved.
-- The app writes 'product' | 'service', so the stale one is removed.
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_kind_check;

-- Sample marketplace content for the App Review demo campus. Every row is
-- fictional sample content owned by PlugU; no real student is impersonated and
-- no fake reviews or transactions are created.
INSERT INTO public.listings
  (id, seller_user_id, school_id, title, description, category, kind,
   price_cents, price_type, campus_name, fulfillment, status, moderation_status)
VALUES
  ('11111111-2222-4333-8444-5555555500c1', '11111111-2222-4333-8444-555555550001',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Gel Set + Lash Refill',
   'Sample listing. Gel manicure with a lash refill, done in the residence hall study lounge. Plan about 90 minutes.',
   'nails', 'service', 6000, 'fixed', 'Demo University', ARRAY['meetup'], 'active', 'approved'),
  ('11111111-2222-4333-8444-5555555500c2', '11111111-2222-4333-8444-555555550001',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Sunday Plate — Home Cooked',
   'Sample listing. One hot plate: baked chicken, rice and greens. Pick up from the dorm lobby on Sunday evenings.',
   'food', 'product', 1200, 'fixed', 'Demo University', ARRAY['pickup'], 'active', 'approved'),
  ('11111111-2222-4333-8444-5555555500c3', '11111111-2222-4333-8444-555555550001',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Dorm Starter Bundle',
   'Sample listing. Mini fridge caddy, desk lamp and shower tote. Gently used, meet at the student center.',
   'dorm', 'product', 3500, 'fixed', 'Demo University', ARRAY['meetup','pickup'], 'active', 'approved'),
  ('11111111-2222-4333-8444-5555555500d1', '11111111-2222-4333-8444-555555550002',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Intro Chemistry Tutoring',
   'Sample listing. One-on-one tutoring for general chemistry, hourly, in the library group rooms.',
   'tutoring', 'service', 2500, 'hourly', 'Demo University', ARRAY['meetup'], 'active', 'approved'),
  ('11111111-2222-4333-8444-5555555500d2', '11111111-2222-4333-8444-555555550002',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Campus Ride — Grocery Run',
   'Sample listing. Round trip to the grocery store off campus. Two riders max, split the trip.',
   'rides', 'service', 800, 'fixed', 'Demo University', ARRAY['meetup'], 'active', 'approved'),
  ('11111111-2222-4333-8444-5555555500d3', '11111111-2222-4333-8444-555555550002',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Beat Pack + Mix Session',
   'Sample listing. Two original beats plus a one hour mixing session in the campus media lab.',
   'music', 'service', 7500, 'starting_at', 'Demo University', ARRAY['meetup','digital'], 'active', 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campus_events
  (id, creator_user_id, school_id, title, description, category, location, starts_at, ends_at, host_name, status)
VALUES
  ('11111111-2222-4333-8444-5555555500e1', '11111111-2222-4333-8444-555555550002',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Student Business Pop-Up',
   'Sample event. Student sellers set up tables on the Yard: hair, nails, prints, thrift and food.',
   'community', 'The Yard', now() + interval '3 days', now() + interval '3 days 4 hours',
   'PlugU Demo Campus', 'active'),
  ('11111111-2222-4333-8444-5555555500e2', '11111111-2222-4333-8444-555555550001',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Late Night Study Session',
   'Sample event. Group study for midterms in the library, with tutoring students on hand.',
   'academic', 'Main Library, 2nd Floor', now() + interval '1 day', now() + interval '1 day 3 hours',
   'PlugU Demo Campus', 'active'),
  ('11111111-2222-4333-8444-5555555500e3', '11111111-2222-4333-8444-555555550002',
   '00459524-4e2c-4aa8-a9e9-11fa1390391f',
   'Homecoming Interest Meeting',
   'Sample event. Planning meeting for homecoming week vendors, performers and volunteers.',
   'community', 'Student Center Ballroom', now() + interval '6 days', now() + interval '6 days 2 hours',
   'PlugU Demo Campus', 'active')
ON CONFLICT (id) DO NOTHING;