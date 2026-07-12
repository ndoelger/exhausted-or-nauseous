#!/usr/bin/env node
/**
 * Seed readable fake users on the Supabase develop branch.
 *
 * Run: npm run seed:dev-users
 *
 * Uses develop service role via `supabase branches get develop`
 * (falls back to .env URL + SUPABASE_SERVICE_ROLE_KEY if set).
 */

const { createClient } = require("@supabase/supabase-js");
const { execSync } = require("child_process");

const PASSWORD = "TestPassword123!";

const USERS = [
  { firstName: "Alice", lastName: "Anderson", username: "alice", email: "alice.anderson@example.com", emotion: "Exhausted" },
  { firstName: "Bob", lastName: "Baker", username: "bob", email: "bob.baker@example.com", emotion: "Nauseous" },
  { firstName: "Carol", lastName: "Chen", username: "carol", email: "carol.chen@example.com", emotion: "Exhausted" },
  { firstName: "Diego", lastName: "Diaz", username: "diego", email: "diego.diaz@example.com", emotion: null },
  { firstName: "Elena", lastName: "Evans", username: "elena", email: "elena.evans@example.com", emotion: "Nauseous" },
  { firstName: "Frank", lastName: "Foster", username: "frank", email: "frank.foster@example.com", emotion: "Exhausted" },
  { firstName: "Grace", lastName: "Garcia", username: "grace", email: "grace.garcia@example.com", emotion: null },
  { firstName: "Hiro", lastName: "Hahn", username: "hiro", email: "hiro.hahn@example.com", emotion: "Nauseous" },
  { firstName: "Ivy", lastName: "Ibrahim", username: "ivy", email: "ivy.ibrahim@example.com", emotion: "Exhausted" },
  { firstName: "Jules", lastName: "Jones", username: "jules", email: "jules.jones@example.com", emotion: null },
  { firstName: "Kai", lastName: "Kim", username: "kai", email: "kai.kim@example.com", emotion: "Nauseous" },
  { firstName: "Lena", lastName: "Lopez", username: "lena", email: "lena.lopez@example.com", emotion: "Exhausted" },
];

function loadDevelopAdmin() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.EXPO_PUBLIC_SUPABASE_URL) {
    return {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  const raw = execSync("npx supabase branches get develop --output json", {
    encoding: "utf8",
  });
  const start = raw.indexOf("{");
  const branch = JSON.parse(raw.slice(start));
  return {
    url: branch.SUPABASE_URL,
    key: branch.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function main() {
  const { url, key } = loadDevelopAdmin();
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Seeding ${USERS.length} users on ${url}\n`);
  console.log(`Shared password: ${PASSWORD}\n`);

  let created = 0;
  let skipped = 0;

  for (const u of USERS) {
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
      // already exists is fine for re-runs
      if (/already|registered|exists/i.test(error.message)) {
        console.log(`  SKIP  ${u.email} (${error.message})`);
        skipped += 1;
        continue;
      }
      console.error(`  FAIL  ${u.email}: ${error.message}`);
      continue;
    }

    if (u.emotion && data.user?.id) {
      const { error: emoErr } = await supabase
        .from("profiles")
        .update({ emotion: u.emotion })
        .eq("id", data.user.id);
      if (emoErr) {
        console.log(`  WARN  ${u.email} created but emotion failed: ${emoErr.message}`);
      }
    }

    console.log(`  OK    ${u.email}  @${u.username}  ${u.emotion ?? "(no emotion)"}`);
    created += 1;
  }

  console.log(`\nDone. created=${created} skipped=${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
