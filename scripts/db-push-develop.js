#!/usr/bin/env node
/**
 * Push migrations to the Supabase develop branch (matches .env app URL).
 *
 * Run: npm run db:push:develop
 *      npm run db:push          (same — develop is the default)
 */
const { execSync } = require("child_process");

function developDbUrl() {
  const raw = execSync("npx supabase branches get develop --output json", {
    encoding: "utf8",
  });
  const branch = JSON.parse(raw.slice(raw.indexOf("{")));
  // Pooler URL works when direct host is IPv6-only
  return branch.POSTGRES_URL || branch.POSTGRES_URL_NON_POOLING;
}

function main() {
  const dbUrl = developDbUrl();
  console.log("[db:push:develop] pushing migrations to develop branch…");
  execSync(`npx supabase db push --db-url "${dbUrl}" --yes`, {
    stdio: "inherit",
  });
  console.log("[db:push:develop] done");
}

main();
