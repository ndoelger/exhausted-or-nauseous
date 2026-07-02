-- allow authenticated users to search all profiles; keep writes scoped to own row
drop policy if exists "Users access own profile" on public.profiles;

create policy "Profiles are searchable"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users delete own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);
