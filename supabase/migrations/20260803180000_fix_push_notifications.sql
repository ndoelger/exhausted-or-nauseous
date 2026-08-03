-- Fix device push + in-app emotion notes.
-- Root cause on production: edge function got "permission denied for table profiles"
-- Also: same-emotion re-taps skipped inserts (felt broken when retesting)

grant select on table public.profiles to service_role;
grant select on table public.notifications to service_role;

create or replace function public.get_expo_push_token(target_user uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select expo_push_token from public.profiles where id = target_user;
$$;

revoke all on function public.get_expo_push_token(uuid) from public;
grant execute on function public.get_expo_push_token(uuid) to service_role;

-- Notify friends on every emotion tap (including same emotion again)
create or replace function public.notify_friends_on_emotion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.emotion is not null then
    insert into public.notifications (user_id, actor_id, type, body)
    select
      case
        when fr.from_user = new.id then fr.to_user
        else fr.from_user
      end,
      new.id,
      'emotion',
      coalesce(new.first_name, 'Someone') || ' is ' || new.emotion
    from public.friend_requests fr
    where fr.status = 'accepted'
      and (fr.from_user = new.id or fr.to_user = new.id);
  end if;

  return new;
end;
$$;

-- Project URL for calling the push edge function from triggers
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

revoke all on table public.app_config from public;
revoke all on table public.app_config from anon;
revoke all on table public.app_config from authenticated;
grant select on table public.app_config to service_role;

create extension if not exists pg_net with schema extensions;

create or replace function public.forward_notification_to_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text;
  payload jsonb;
begin
  select value into project_url
  from public.app_config
  where key = 'supabase_url';

  if project_url is null or project_url = '' then
    raise notice 'app_config.supabase_url missing — skip device push';
    return new;
  end if;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'notifications',
    'schema', 'public',
    'record', jsonb_build_object(
      'id', new.id,
      'user_id', new.user_id,
      'actor_id', new.actor_id,
      'body', new.body,
      'type', new.type
    )
  );

  perform net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := payload
  );

  return new;
end;
$$;

drop trigger if exists on_notification_forward_push on public.notifications;
create trigger on_notification_forward_push
  after insert on public.notifications
  for each row
  execute function public.forward_notification_to_push();

-- Live badge in the app
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when SQLSTATE '42710' then null;
end;
$$;