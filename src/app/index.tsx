import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import Home from "./home";
import Login from "./login";

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  emotion: "Exhausted" | "Nauseous" | null;
}

const Index = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const updateEmotion = async (emotion: "Exhausted" | "Nauseous") => {
    if (!profile) return;
    setProfile({ ...profile, emotion });
    await supabase.from("profiles").update({ emotion }).eq("id", profile.id);
  }

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, username, emotion")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        console.error(error);
        return;
      }
      setProfile({
        id: data.id,
        email: data.email!,
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        username: data.username ?? "",
        emotion: data.emotion ?? null
      });
    };
    loadSession();
  }, []);

  return !profile ? <Login setProfile={setProfile} /> : <Home profile={profile} updateEmotion={updateEmotion} />;
};

export default Index;
