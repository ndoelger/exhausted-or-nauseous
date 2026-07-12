-- notify the requester when their friend request is accepted
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('emotion', 'friend_request', 'friend_accepted'));

create or replace function public.notify_on_friend_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_name text;
begin
  if not (old.status is distinct from 'accepted' and new.status = 'accepted') then
    return new;
  end if;

  select coalesce(p.first_name, p.username, 'Someone')
    into actor_name
  from public.profiles p
  where p.id = new.to_user;

  insert into public.notifications (user_id, actor_id, type, body)
  values (
    new.from_user,
    new.to_user,
    'friend_accepted',
    actor_name || ' accepted your friend request :D'
  );

  return new;
end;
$$;

drop trigger if exists on_friend_request_accepted on public.friend_requests;

create trigger on_friend_request_accepted
  after update of status on public.friend_requests
  for each row
  execute function public.notify_on_friend_accepted();
