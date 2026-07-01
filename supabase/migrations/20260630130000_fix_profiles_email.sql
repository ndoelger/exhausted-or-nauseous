-- create_profiles may have run before email was in the trigger
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, email, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName'
  );
  return new;
end;
$$;

-- backfill emails for profiles created before the trigger included email
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;
