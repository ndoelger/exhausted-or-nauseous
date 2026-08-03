import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { EMOTION, mapProfile, type Profile } from "@/types/profile";
import { registerPushToken } from "../../utils/register-push";
import { supabase } from "../../utils/supabase";
import Home from "./home";
import Login from "./login";
import Onboarding from "./onboarding";

export type { Profile };

const needsOnboarding = (profile: Profile) =>
  !profile.firstName.trim() ||
  !profile.lastName.trim() ||
  !profile.username.trim();

const Index = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = async (userId: string, phoneFromAuth?: string | null) => {
    // Public columns only — phone / push token are not readable by others (DB grants)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, username, emotion, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("[auth] profile load failed", error);
      // Session without a usable profile — sign out so Login isn't a dead end
      await supabase.auth.signOut();
      setProfile(null);
      return;
    }

    setProfile(
      mapProfile({
        ...data,
        phone: phoneFromAuth ?? null,
      }),
    );
    registerPushToken(data.id);
  };

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.phone).finally(() =>
          setReady(true),
        );
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
        loadProfile(session.user.id, session.user.phone);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateEmotion = async (emotion: "Exhausted" | "Nauseous") => {
    if (!profile) return;
    const next = EMOTION[emotion];
    const prev = profile.emotion;
    setProfile({ ...profile, emotion: next });
    const { error } = await supabase
      .from("profiles")
      .update({ emotion: next })
      .eq("id", profile.id);
    if (error) {
      console.error("[home] emotion update failed", error);
      setProfile({ ...profile, emotion: prev });
      Alert.alert("Could not update. Try again.");
    }
  };

  if (!ready) return null;

  if (!profile) return <Login />;

  if (needsOnboarding(profile)) {
    return <Onboarding profile={profile} onComplete={setProfile} />;
  }

  return (
    <Home
      profile={profile}
      setProfile={setProfile}
      updateEmotion={updateEmotion}
    />
  );
};

export default Index;
