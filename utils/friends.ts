import { type Profile, unwrapProfile } from "@/types/profile";
import { supabase } from "./supabase";

export type FriendStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "rejected"
  | "self";

export type Friendship = {
  status: FriendStatus;
  requestId: string | null;
};

export type FriendRow = {
  requestId: string;
  user: Profile;
};

const PROFILE_FIELDS =
  "id, username, first_name, last_name, avatar_url, emotion";

/** Accepted friends + incoming pending requests for this user. */
export async function listFriends(profileId: string): Promise<{
  friends: FriendRow[];
  requests: FriendRow[];
  error: Error | null;
}> {
  const [accepted, pending] = await Promise.all([
    supabase
      .from("friend_requests")
      .select(
        `
        id, from_user, to_user,
        from_profile:profiles!friend_requests_from_user_fkey(${PROFILE_FIELDS}),
        to_profile:profiles!friend_requests_to_user_fkey(${PROFILE_FIELDS})
      `,
      )
      .eq("status", "accepted")
      .or(`from_user.eq.${profileId},to_user.eq.${profileId}`),
    supabase
      .from("friend_requests")
      .select(
        `
        id,
        from_profile:profiles!friend_requests_from_user_fkey(${PROFILE_FIELDS})
      `,
      )
      .eq("status", "pending")
      .eq("to_user", profileId),
  ]);

  if (accepted.error || pending.error) {
    const error = accepted.error ?? pending.error;
    console.error(error);
    return { friends: [], requests: [], error };
  }

  const friends: FriendRow[] = [];
  for (const row of accepted.data ?? []) {
    const other =
      row.from_user === profileId
        ? unwrapProfile(row.to_profile)
        : unwrapProfile(row.from_profile);
    if (other) friends.push({ requestId: row.id, user: other });
  }

  const requests: FriendRow[] = [];
  for (const row of pending.data ?? []) {
    const user = unwrapProfile(row.from_profile);
    if (user) requests.push({ requestId: row.id, user });
  }

  return { friends, requests, error: null };
}

export async function getFriendship(
  myId: string,
  otherId: string,
): Promise<Friendship> {
  if (myId === otherId) {
    return { status: "self", requestId: null };
  }

  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, from_user, to_user, status")
    .or(
      `and(from_user.eq.${myId},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${myId})`,
    )
    .maybeSingle();

  if (error) {
    console.error(error);
    return { status: "none", requestId: null };
  }

  if (!data) {
    return { status: "none", requestId: null };
  }

  if (data.status === "accepted") {
    return { status: "accepted", requestId: data.id };
  }
  if (data.status === "rejected") {
    return { status: "rejected", requestId: data.id };
  }
  if (data.from_user === myId) {
    return { status: "pending_sent", requestId: data.id };
  }
  return { status: "pending_received", requestId: data.id };
}

export async function sendFriendRequest(myId: string, otherId: string) {
  const { data, error } = await supabase
    .from("friend_requests")
    .insert({ from_user: myId, to_user: otherId, status: "pending" })
    .select("id")
    .single();

  return { data, error };
}

export async function respondFriendRequest(
  requestId: string,
  status: "accepted" | "rejected",
) {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status })
    .eq("id", requestId);

  return { error };
}

export async function unfriend(requestId: string) {
  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .eq("id", requestId);

  return { error };
}
