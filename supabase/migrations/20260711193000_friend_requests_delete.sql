-- either party can remove a friendship / request
grant delete on table public.friend_requests to authenticated;

create policy "Users can delete own friend requests"
  on public.friend_requests
  for delete
  to authenticated
  using (auth.uid() = from_user or auth.uid() = to_user);
