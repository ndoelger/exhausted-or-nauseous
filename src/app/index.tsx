import { useEffect, useState } from "react";
import { EMOTION, mapProfile, type Profile } from "@/types/profile";
import { registerPushToken } from "../../utils/register-push";
import { supabase } from "../../utils/supabase";
import Home from "./home";
import Login from "./login";

export type { Profile };

const Index = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, first_name, last_name, username, emotion, avatar_url",
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(error);
      setProfile(null);
      return;
    }

    setProfile(mapProfile(data));
    registerPushToken(data.id);
  };

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setReady(true));
      } else {
        setReady(true);
      }
    });

    // keep profile in sync with auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth]", event);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateEmotion = async (emotion: "Exhausted" | "Nauseous") => {
    if (!profile) return;
    const next = EMOTION[emotion];
    setProfile({ ...profile, emotion: next });
    await supabase.from("profiles").update({ emotion: next }).eq("id", profile.id);
  };

  if (!ready) return null;

  return !profile ? (
    <Login />
  ) : (
    <Home
      profile={profile}
      setProfile={setProfile}
      updateEmotion={updateEmotion}
    />
  );
};

export default Index;
