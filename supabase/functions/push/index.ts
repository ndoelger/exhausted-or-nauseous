/**
 * Expo push sender — triggered by a Database Webhook on public.notifications INSERT.
 *
 * REQUIRED before production (verify in dashboard):
 * 1. Create an Expo access token (expo.dev → Access tokens), enable Enhanced Security
 * 2. npx supabase secrets set EXPO_ACCESS_TOKEN=your_token  (on the app’s branch)
 * 3. npx supabase functions deploy push --no-verify-jwt
 * 4. Dashboard → Database → Webhooks → create hook:
 *    - table: notifications, event: Insert
 *    - type: Supabase Edge Functions → push
 *    - auth header: Bearer <service_role_key>
 *
 * Without 2–4, YO notifications stay in-app only (no device push).
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string;
  body: string;
  type: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: NotificationRow;
  schema: string;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    if (payload.type !== "INSERT" || payload.table !== "notifications") {
      return Response.json({ skipped: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", payload.record.user_id)
      .single();

    if (error) {
      console.error("profile lookup failed", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const token = profile?.expo_push_token;
    if (!token) {
      console.log("no push token for user", payload.record.user_id);
      return Response.json({ skipped: true, reason: "no_token" });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (expoAccessToken) {
      headers.Authorization = `Bearer ${expoAccessToken}`;
    }

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers,
      body: JSON.stringify({
        to: token,
        sound: "default",
        title: "Exhausted or Nauseous",
        body: payload.record.body,
        data: {
          notificationId: payload.record.id,
          type: payload.record.type,
          actorId: payload.record.actor_id,
        },
      }),
    });

    const result = await res.json();
    console.log("expo push result", result);
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
});
