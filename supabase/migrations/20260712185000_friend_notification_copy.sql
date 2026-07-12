-- update friend notification copy
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
