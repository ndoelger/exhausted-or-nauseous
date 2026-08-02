-- Replace email with phone on profiles (phone OTP auth)

alter table public.profiles
  add column if not exists phone text;

-- unique like email was; ignore if already present
do $$
begin
  alter table public.profiles add constraint profiles_phone_key unique (phone);
exception
  when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, phone, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.phone,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName'
  );
  return new;
end;
$$;

-- backfill phones for existing profiles from auth.users
update public.profiles p
set phone = u.phone
from auth.users u
where p.id = u.id
  and p.phone is null
  and u.phone is not null;

alter table public.profiles drop column if exists email;
