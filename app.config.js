/**
 * Dynamic Expo config — variants via APP_VARIANT.
 * development | staging | production (default)
 *
 * Staging builds share the Supabase `develop` branch.
 * Production builds use Supabase `main`.
 */
export default ({ config }) => {
  const variant = process.env.APP_VARIANT || "production";
  const isDev = variant === "development";
  const isStaging = variant === "staging";

  const name = isDev
    ? "EON (Dev)"
    : isStaging
      ? "EON (Staging)"
      : config.name;

  // Separate IDs so staging/dev can sit next to production on one device
  const idSuffix = isDev ? ".dev" : isStaging ? ".staging" : "";
  const bundleId = `com.ndoelgersteam.exhaustedornauseous${idSuffix}`;
  const scheme = isDev
    ? "exhaustedornauseousdev"
    : isStaging
      ? "exhaustedornauseousstaging"
      : config.scheme;

  console.log(`[app.config] variant=${variant} bundle=${bundleId}`);

  return {
    ...config,
    name,
    scheme,
    ios: {
      ...config.ios,
      bundleIdentifier: bundleId,
    },
    android: {
      ...config.android,
      package: bundleId,
    },
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
