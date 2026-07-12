-- allow friend-request notification type + notify recipient on new pending request
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('emotion', 'friend_request'));

create or replace function public.notify_on_friend_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_name text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select coalesce(p.first_name, p.username, 'Someone')
    into actor_name
  from public.profiles p
  where p.id = new.from_user;

  insert into public.notifications (user_id, actor_id, type, body)
  values (
    new.to_user,
    new.from_user,
    'friend_request',
    actor_name || ' sent you a friend request :0'
  );

  return new;
end;
$$;

drop trigger if exists on_friend_request_created on public.friend_requests;

create trigger on_friend_request_created
  after insert on public.friend_requests
  for each row
  execute function public.notify_on_friend_request();
