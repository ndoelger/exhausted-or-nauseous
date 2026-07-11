-- avatar url on profiles
alter table public.profiles add column if not exists avatar_url text;

-- public avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- anyone can view avatars
create policy "Avatars are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- users upload to their own folder: user-<uid>/...
create policy "Users can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = 'user-' || auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = 'user-' || auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = 'user-' || auth.uid()::text
  );
