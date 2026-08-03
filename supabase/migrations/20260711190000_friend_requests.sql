-- friend requests between profiles
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (from_user, to_user),
  check (from_user <> to_user)
);

alter table public.friend_requests enable row level security;

grant select, insert, update on table public.friend_requests to authenticated;

-- see requests you sent or received
create policy "Users can view own friend requests"
  on public.friend_requests
  for select
  to authenticated
  using (auth.uid() = from_user or auth.uid() = to_user);

-- send a request as yourself
create policy "Users can send friend requests"
  on public.friend_requests
  for insert
  to authenticated
  with check (auth.uid() = from_user);

-- recipient can accept/reject
create policy "Recipients can update friend requests"
  on public.friend_requests
  for update
  to authenticated
  using (auth.uid() = to_user)
  with check (auth.uid() = to_user);
