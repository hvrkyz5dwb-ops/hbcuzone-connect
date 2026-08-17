insert into public.schools (name, domain, type, city, state, is_active)
values ('PlugU Demo University', 'plugu.app', 'university', 'Atlanta', 'GA', true)
on conflict do nothing;

update public.profiles p
set school_id = s.id,
    school_name = s.name,
    school_domain = s.domain,
    verification_status = 'verified'
from public.schools s
where s.domain = 'plugu.app' and p.email = 'appreview@plugu.app';