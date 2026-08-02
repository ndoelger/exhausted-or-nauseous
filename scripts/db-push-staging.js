#!/usr/bin/env node
/**
 * Push migrations to the Supabase staging backend (`develop` branch).
 *
 * Staging app builds (EAS profile `staging` / `preview`) should use this DB.
 * Production uses Supabase `main` — push there separately when releasing.
 *
 * Run: npm run db:push:staging
 *      npm run db:push
 */
const { execSync } = require("child_process");

function developDbUrl() {
  const raw = execSync("npx supabase branches get develop --output json", {
    encoding: "utf8",
  });
  const branch = JSON.parse(raw.slice(raw.indexOf("{")));
  return branch.POSTGRES_URL || branch.POSTGRES_URL_NON_POOLING;
}

function main() {
  const dbUrl = developDbUrl();
  console.log("[db:push:staging] pushing migrations to develop (staging)…");
  execSync(`npx supabase db push --db-url "${dbUrl}" --yes`, {
    stdio: "inherit",
  });
  console.log("[db:push:staging] done");
}

main();
