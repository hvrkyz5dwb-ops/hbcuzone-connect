insert into public.campus_zones (school_id, name, kind, x, y, sort)
select s.id, z.name, z.kind, z.x, z.y, z.sort
from public.schools s
cross join (values
  ('The Yard','common',50,48,1),
  ('Student Center','common',62,38,2),
  ('Main Dining Hall','food',34,52,3),
  ('Library','study',70,60,4),
  ('Freshman Dorms','dorm',24,34,5),
  ('Upperclassmen Dorms','dorm',78,30,6),
  ('Rec Center / Gym','fitness',44,72,7),
  ('Academic Quad','academic',56,64,8),
  ('Stadium','athletics',20,74,9),
  ('Main Gate','transit',50,88,10)
) as z(name, kind, x, y, sort)
where not exists (
  select 1 from public.campus_zones cz where cz.school_id = s.id and cz.name = z.name
);