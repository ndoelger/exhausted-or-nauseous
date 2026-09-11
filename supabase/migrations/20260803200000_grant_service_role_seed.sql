-- service_role needs table grants for admin/seed scripts
-- (bypasses RLS but still needs GRANT)

grant select, update on table public.profiles to service_role;

grant select, insert, update, delete on table public.friend_requests to service_role;
