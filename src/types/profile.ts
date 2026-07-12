export type Emotion = "Exhausted 🥱" | "Nauseous 🤢" | null;

export const EMOTION = {
  Exhausted: "Exhausted 🥱",
  Nauseous: "Nauseous 🤢",
} as const;

/** App profile shape (camelCase). Use mapProfile() at the Supabase boundary. */
export type Profile = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  username: string;
  emotion: Emotion;
  avatarUrl: string | null;
};

/** Raw profiles row from Supabase */
export type ProfileRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  emotion?: string | null;
  avatar_url?: string | null;
};

function mapEmotion(value?: string | null): Emotion {
  if (!value) return null;
  if (value.startsWith("Exhausted")) return EMOTION.Exhausted;
  if (value.startsWith("Nauseous")) return EMOTION.Nauseous;
  return null;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email ?? null,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    username: row.username ?? "",
    emotion: mapEmotion(row.emotion),
    avatarUrl: row.avatar_url ?? null,
  };
}

export function unwrapProfile(value: unknown): Profile | null {
  if (!value) return null;
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object" || !("id" in row)) return null;
  return mapProfile(row as ProfileRow);
}
