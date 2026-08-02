#!/usr/bin/env node
/**
 * Push migrations to Supabase production (`main` branch).
 * Run only when releasing: npm run db:push:production
 */
const { execSync } = require("child_process");

function mainDbUrl() {
  const raw = execSync("npx supabase branches get main --output json", {
    encoding: "utf8",
  });
  const branch = JSON.parse(raw.slice(raw.indexOf("{")));
  return branch.POSTGRES_URL || branch.POSTGRES_URL_NON_POOLING;
}

function main() {
  const dbUrl = mainDbUrl();
  console.log("[db:push:production] pushing migrations to main…");
  execSync(`npx supabase db push --db-url "${dbUrl}" --yes`, {
    stdio: "inherit",
  });
  console.log("[db:push:production] done");
}

main();
