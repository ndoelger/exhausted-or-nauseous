-- Hide phone + expo_push_token from other authenticated clients.
-- Own phone comes from auth.users via the session; push sender uses service role.

revoke select on table public.profiles from authenticated;

grant select (
  id,
  username,
  first_name,
  last_name,
  avatar_url,
  emotion
) on table public.profiles to authenticated;

-- Own-row writes (RLS still scopes to auth.uid() = id)
grant update (
  username,
  first_name,
  last_name,
  avatar_url,
  emotion,
  expo_push_token
) on table public.profiles to authenticated;

grant delete on table public.profiles to authenticated;
