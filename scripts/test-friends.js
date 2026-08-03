#!/usr/bin/env node
/**
 * Friend-request QA against the live Supabase project.
 *
 * Run: npm run test:friends
 *
 * Uses EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_KEY from .env
 * Creates temporary users, exercises send / accept / reject / duplicate, then prints pass/fail.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// --- load .env (no dotenv dependency) ---
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env (need EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY)");
  }
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

loadEnv();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
if (!url || !key) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY");
  process.exit(1);
}

const stamp = Date.now().toString(36);
const password = "TestPassword123!";

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function client() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signup(label) {
  const email = `qa-friends-${label}-${stamp}@example.com`;
  const username = `qa_${label}_${stamp}`;
  const sb = client();

  console.log(`\n[setup] signing up ${label} (${email})`);
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: label.toUpperCase(),
        lastName: "QA",
        username,
      },
    },
  });

  if (error) throw new Error(`signup ${label}: ${error.message}`);
  if (!data.user) throw new Error(`signup ${label}: no user returned`);
  if (!data.session) {
    throw new Error(
      `signup ${label}: no session (disable email confirm in Supabase Auth for QA, or confirm the user)`,
    );
  }

  // wait briefly for handle_new_user trigger to create profile
  let profile = null;
  for (let i = 0; i < 10; i++) {
    const { data: row } = await sb
      .from("profiles")
      .select("id, username")
      .eq("id", data.user.id)
      .maybeSingle();
    if (row) {
      profile = row;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  if (!profile) throw new Error(`signup ${label}: profile row not created`);

  console.log(`[setup] ${label} ready id=${profile.id}`);
  return { sb, user: data.user, profile, email };
}

async function getRequest(sb, fromId, toId) {
  const { data, error } = await sb
    .from("friend_requests")
    .select("id, from_user, to_user, status")
    .eq("from_user", fromId)
    .eq("to_user", toId)
    .maybeSingle();
  if (error) throw new Error(`getRequest: ${error.message}`);
  return data;
}

async function main() {
  console.log("=== Friend requests QA ===");
  console.log(`Supabase: ${url}`);

  const a = await signup("a");
  const b = await signup("b");
  const c = await signup("c");

  // 1) A sends request to B
  console.log("\n[test] A sends friend request to B");
  {
    const { data, error } = await a.sb
      .from("friend_requests")
      .insert({
        from_user: a.profile.id,
        to_user: b.profile.id,
        status: "pending",
      })
      .select("id, status")
      .single();
    assert("A→B insert succeeds", !error && !!data, error?.message);
    assert("A→B status is pending", data?.status === "pending", data?.status);
  }

  // 2) B can see the pending request
  console.log("\n[test] B can read pending request");
  {
    const row = await getRequest(b.sb, a.profile.id, b.profile.id);
    assert("B sees A→B request", !!row, "row missing");
    assert("B sees status pending", row?.status === "pending", row?.status);
  }

  // 3) Duplicate A→B should fail (unique constraint)
  console.log("\n[test] duplicate A→B is rejected");
  {
    const { error } = await a.sb.from("friend_requests").insert({
      from_user: a.profile.id,
      to_user: b.profile.id,
      status: "pending",
    });
    assert("duplicate insert fails", !!error, "expected an error");
  }

  // 4) A cannot accept their own outgoing request (only recipient can update)
  console.log("\n[test] sender cannot accept own request");
  {
    const row = await getRequest(a.sb, a.profile.id, b.profile.id);
    const { data, error } = await a.sb
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", row.id)
      .select("id, status");
    // RLS should block; either error or zero rows updated
    const blocked = !!error || !data || data.length === 0;
    assert("sender update blocked by RLS", blocked, error?.message ?? `updated ${data?.length}`);
    const after = await getRequest(a.sb, a.profile.id, b.profile.id);
    assert("status still pending after sender attempt", after?.status === "pending", after?.status);
  }

  // 5) B accepts
  console.log("\n[test] B accepts A→B");
  {
    const row = await getRequest(b.sb, a.profile.id, b.profile.id);
    const { data, error } = await b.sb
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", row.id)
      .select("id, status")
      .single();
    assert("B accept succeeds", !error && data?.status === "accepted", error?.message);
  }

  // 6) Both see accepted
  console.log("\n[test] both sides see accepted friendship");
  {
    const forA = await getRequest(a.sb, a.profile.id, b.profile.id);
    const forB = await getRequest(b.sb, a.profile.id, b.profile.id);
    assert("A sees accepted", forA?.status === "accepted", forA?.status);
    assert("B sees accepted", forB?.status === "accepted", forB?.status);
  }

  // 6b) Third party cannot unfriend A↔B
  console.log("\n[test] third party cannot unfriend A↔B");
  {
    const row = await getRequest(a.sb, a.profile.id, b.profile.id);
    const { data, error } = await c.sb
      .from("friend_requests")
      .delete()
      .eq("id", row.id)
      .select("id");
    const blocked = !!error || !data || data.length === 0;
    assert("C delete blocked by RLS", blocked, error?.message ?? `deleted ${data?.length}`);
    const stillThere = await getRequest(a.sb, a.profile.id, b.profile.id);
    assert("A↔B still exists after C delete attempt", !!stillThere, "row missing");
  }

  // 7) A unfriends B
  console.log("\n[test] A unfriends B");
  {
    const row = await getRequest(a.sb, a.profile.id, b.profile.id);
    const { data, error } = await a.sb
      .from("friend_requests")
      .delete()
      .eq("id", row.id)
      .select("id");
    assert("A unfriend delete succeeds", !error && data?.length === 1, error?.message);

    const forA = await getRequest(a.sb, a.profile.id, b.profile.id);
    const forB = await getRequest(b.sb, a.profile.id, b.profile.id);
    assert("A no longer sees friendship", !forA, forA?.status);
    assert("B no longer sees friendship", !forB, forB?.status);
  }

  // 8) After unfriend, A can send again; B accepts; B unfriends
  console.log("\n[test] re-add after unfriend, then B unfriends");
  {
    const { data: inserted, error: insertError } = await a.sb
      .from("friend_requests")
      .insert({
        from_user: a.profile.id,
        to_user: b.profile.id,
        status: "pending",
      })
      .select("id")
      .single();
    assert("A→B re-send succeeds", !insertError && !!inserted, insertError?.message);

    const { error: acceptError } = await b.sb
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", inserted.id);
    assert("B re-accept succeeds", !acceptError, acceptError?.message);

    const { data: deleted, error: unfriendError } = await b.sb
      .from("friend_requests")
      .delete()
      .eq("id", inserted.id)
      .select("id");
    assert("B unfriend delete succeeds", !unfriendError && deleted?.length === 1, unfriendError?.message);

    const gone = await getRequest(a.sb, a.profile.id, b.profile.id);
    assert("friendship gone after B unfriends", !gone, gone?.status);
  }

  // 9) A→C pending, C rejects
  console.log("\n[test] A→C request then C rejects");
  {
    const { data: inserted, error: insertError } = await a.sb
      .from("friend_requests")
      .insert({
        from_user: a.profile.id,
        to_user: c.profile.id,
        status: "pending",
      })
      .select("id")
      .single();
    assert("A→C insert succeeds", !insertError && !!inserted, insertError?.message);

    const { data: rejected, error: rejectError } = await c.sb
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", inserted.id)
      .select("id, status")
      .single();
    assert("C reject succeeds", !rejectError && rejected?.status === "rejected", rejectError?.message);

    const forA = await getRequest(a.sb, a.profile.id, c.profile.id);
    assert("A sees rejected", forA?.status === "rejected", forA?.status);
  }

  // 10) Self-request blocked by check constraint
  console.log("\n[test] self friend request is blocked");
  {
    const { error } = await a.sb.from("friend_requests").insert({
      from_user: a.profile.id,
      to_user: a.profile.id,
      status: "pending",
    });
    assert("self-request fails", !!error, "expected an error");
  }

  // 11) C cannot read A↔B (none exists now — use A↔C rejected row privacy for unrelated pair)
  console.log("\n[test] third party cannot read unrelated requests");
  {
    // create a fresh A→B pending that C should not see
    const { data: inserted } = await a.sb
      .from("friend_requests")
      .insert({
        from_user: a.profile.id,
        to_user: b.profile.id,
        status: "pending",
      })
      .select("id")
      .single();

    const { data, error } = await c.sb
      .from("friend_requests")
      .select("id")
      .eq("id", inserted.id);
    assert("no query error for C", !error, error?.message);
    assert("C sees zero rows for A→B", (data?.length ?? 0) === 0, `saw ${data?.length}`);
  }

  console.log("\n=== Results ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(
    `\nNote: left QA users in Auth/profiles (qa-friends-*-${stamp}@example.com). Safe to delete later in Supabase dashboard.`,
  );

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\nQA crashed:", err.message || err);
  process.exit(1);
});
