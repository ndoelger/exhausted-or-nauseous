create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  email text unique,
  first_name text,
  last_name text
);

alter table public.profiles enable row level security;

create policy "Users access own profile"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
