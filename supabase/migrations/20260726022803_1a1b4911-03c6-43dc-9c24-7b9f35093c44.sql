-- handle_new_user is a trigger function only, not intended to be called by users
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- has_role is called only from RLS policies (which run as definer); revoke direct execute
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- Keep authenticated able to call it for client-side role checks
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;