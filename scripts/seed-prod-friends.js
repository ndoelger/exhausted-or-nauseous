#!/usr/bin/env node
/**
 * Seed test profiles on production and make them all friends (full clique).
 *
 * Requires in .env:
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   SEED_FRIEND_WITH=<profile uuid or username>
 *     also friend every seeded user with that existing profile
 *
 * Run: npm run seed:prod-friends
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const PASSWORD = "TestPassword123!";

// Fake names + emotions for a readable test clique
const USERS = [
  { firstName: "Alice", lastName: "Anderson", username: "alice", email: "alice.anderson@example.com", emotion: "Exhausted 🥱" },
  { firstName: "Bob", lastName: "Baker", username: "bob", email: "bob.baker@example.com", emotion: "Nauseous 🤢" },
  { firstName: "Carol", lastName: "Chen", username: "carol", email: "carol.chen@example.com", emotion: "Exhausted 🥱" },
  { firstName: "Diego", lastName: "Diaz", username: "diego", email: "diego.diaz@example.com", emotion: null },
  { firstName: "Elena", lastName: "Evans", username: "elena", email: "elena.evans@example.com", emotion: "Nauseous 🤢" },
  { firstName: "Frank", lastName: "Foster", username: "frank", email: "frank.foster@example.com", emotion: "Exhausted 🥱" },
  { firstName: "Grace", lastName: "Garcia", username: "grace", email: "grace.garcia@example.com", emotion: null },
  { firstName: "Hiro", lastName: "Hahn", username: "hiro", email: "hiro.hahn@example.com", emotion: "Nauseous 🤢" },
  { firstName: "Ivy", lastName: "Ibrahim", username: "ivy", email: "ivy.ibrahim@example.com", emotion: "Exhausted 🥱" },
  { firstName: "Jules", lastName: "Jones", username: "jules", email: "jules.jones@example.com", emotion: null },
  { firstName: "Kai", lastName: "Kim", username: "kai", email: "kai.kim@example.com", emotion: "Nauseous 🤢" },
  { firstName: "Lena", lastName: "Lopez", username: "lena", email: "lena.lopez@example.com", emotion: "Exhausted 🥱" },
];

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i);
    const value = trimmed.slice(i + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function findExistingUserId(supabase, email) {
  // listUsers is paginated; for a small seed we scan a few pages
  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function resolveFriendWith(supabase, raw) {
  if (!raw) return null;
  const value = raw.trim();
  // uuid?
  if (/^[0-9a-f-]{36}$/i.test(value)) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", value)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`SEED_FRIEND_WITH id not found: ${value}`);
    return data;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", value)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`SEED_FRIEND_WITH username not found: ${value}`);
  return data;
}

async function ensureAcceptedFriendship(supabase, a, b) {
  // check either direction
  const { data: existing, error: findErr } = await supabase
    .from("friend_requests")
    .select("id, status, from_user, to_user")
    .or(
      `and(from_user.eq.${a},to_user.eq.${b}),and(from_user.eq.${b},to_user.eq.${a})`,
    )
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing) {
    if (existing.status === "accepted") return "exists";
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", existing.id);
    if (error) throw error;
    return "updated";
  }

  const { error } = await supabase.from("friend_requests").insert({
    from_user: a,
    to_user: b,
    status: "accepted",
  });
  if (error) throw error;
  return "created";
}

async function main() {
  loadEnv();

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }

  // workflow: admin client bypasses RLS so we can insert accepted friendships directly
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`[seed] target: ${url}`);
  console.log(`[seed] creating/updating ${USERS.length} test users`);
  console.log(`[seed] shared password: ${PASSWORD}\n`);

  const ids = [];

  for (const u of USERS) {
    // 1) create auth user (trigger stubs profiles row)
    let userId = null;
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
      },
    });

    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        userId = await findExistingUserId(supabase, u.email);
        if (!userId) {
          console.log(`  FAIL  ${u.email}: exists but could not resolve id`);
          continue;
        }
        console.log(`  SKIP  ${u.email} (already exists) id=${userId}`);
      } else {
        console.error(`  FAIL  ${u.email}: ${error.message}`);
        continue;
      }
    } else {
      userId = data.user.id;
      console.log(`  OK    ${u.email}  @${u.username}  id=${userId}`);
    }

    // 2) fill profile fields (names may already be set by trigger)
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        username: u.username,
        first_name: u.firstName,
        last_name: u.lastName,
        emotion: u.emotion,
      })
      .eq("id", userId);
    if (profileErr) {
      console.log(`  WARN  profile update ${u.username}: ${profileErr.message}`);
    }

    ids.push(userId);
  }

  console.log(`\n[seed] linking ${ids.length} users as a full friend clique…`);

  let created = 0;
  let updated = 0;
  let existed = 0;

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const result = await ensureAcceptedFriendship(supabase, ids[i], ids[j]);
      if (result === "created") created += 1;
      else if (result === "updated") updated += 1;
      else existed += 1;
    }
  }

  console.log(
    `[seed] friendships: created=${created} updated=${updated} already_accepted=${existed}`,
  );

  // optional: also friend an existing real profile (your account)
  const friendWith = await resolveFriendWith(
    supabase,
    process.env.SEED_FRIEND_WITH,
  );
  if (friendWith) {
    console.log(
      `\n[seed] also friending all seeded users with @${friendWith.username} (${friendWith.id})`,
    );
    let extra = 0;
    for (const id of ids) {
      if (id === friendWith.id) continue;
      await ensureAcceptedFriendship(supabase, id, friendWith.id);
      extra += 1;
    }
    console.log(`[seed] linked ${extra} friendships to @${friendWith.username}`);
  }

  console.log("\n[seed] done.");
  console.log("Log in as any alice.anderson@example.com … lena.lopez@example.com with password above.");
  console.log("Search by username (alice, bob, …) to find them.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
