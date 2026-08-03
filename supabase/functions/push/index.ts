/**
 * Expo push sender — triggered when public.notifications gets an INSERT
 * (via DB trigger forward_notification_to_push → pg_net, or a Dashboard webhook).
 *
 * Requires EXPO_ACCESS_TOKEN secret when Expo Enhanced Security is on.
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

    // Prefer security-definer RPC (works with column-level grants on profiles)
    const { data: token, error } = await supabase.rpc("get_expo_push_token", {
      target_user: payload.record.user_id,
    });

    if (error) {
      console.error("token lookup failed", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

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
