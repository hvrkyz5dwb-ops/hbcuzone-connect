GRANT SELECT ON public.campus_places TO anon;
CREATE POLICY "places_anon_read_published" ON public.campus_places FOR SELECT TO anon USING (is_published = true);