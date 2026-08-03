-- in-app notifications (e.g. friend emotion updates)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('emotion')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

grant select, update on table public.notifications to authenticated;

-- recipients can read their notifications
create policy "Users can view own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

-- recipients can mark as read
create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- when a profile emotion changes, notify all accepted friends
create or replace function public.notify_friends_on_emotion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.emotion is distinct from old.emotion and new.emotion is not null then
    insert into public.notifications (user_id, actor_id, type, body)
    select
      case
        when fr.from_user = new.id then fr.to_user
        else fr.from_user
      end,
      new.id,
      'emotion',
      new.emotion
    from public.friend_requests fr
    where fr.status = 'accepted'
      and (fr.from_user = new.id or fr.to_user = new.id);
  end if;

  return new;
end;
$$;

create trigger on_profile_emotion_updated
  after update of emotion on public.profiles
  for each row
  execute function public.notify_friends_on_emotion();
