-- Phone OTP creates a stub profile; first/last name + avatar are filled in onboarding

alter table public.profiles
  add column if not exists avatar_url text;

-- names stay nullable so first sign-in can land before onboarding
comment on column public.profiles.first_name is
  'Set during onboarding after phone OTP; null until then';
comment on column public.profiles.last_name is
  'Set during onboarding after phone OTP; null until then';
comment on column public.profiles.avatar_url is
  'Optional; set during onboarding or later in profile edit';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Stub row for phone auth; metadata names/avatar only if already provided
  insert into public.profiles (
    id,
    phone,
    username,
    first_name,
    last_name,
    avatar_url
  )
  values (
    new.id,
    new.phone,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    new.raw_user_meta_data ->> 'avatarUrl'
  );
  return new;
end;
$$;
