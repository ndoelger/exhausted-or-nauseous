-- store Expo push tokens on profiles
alter table public.profiles
  add column if not exists expo_push_token text;

-- store a full message in notification body ("Nic is Exhausted")
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
      coalesce(new.first_name, 'Someone') || ' is ' || new.emotion
    from public.friend_requests fr
    where fr.status = 'accepted'
      and (fr.from_user = new.id or fr.to_user = new.id);
  end if;

  return new;
end;
$$;
