import { Pressable, StyleSheet, Text, View } from "react-native";
import { Profile } from ".";
import { supabase } from "../../utils/supabase";
import { router } from "expo-router";
import Search from "@/components/search";

interface Props {
  profile: Profile;
}

const Home = ({ profile }: Props) => {
  return (
    <View style={styles.container}>
      <Search />
      <Text style={styles.text}>{profile.firstName}</Text>
      <Text style={styles.text}>{profile.lastName}</Text>
      <Text style={styles.text}>{profile.email}</Text>
      <Text style={styles.text}>{profile.username}</Text>
      <Text style={styles.text}>{profile.id}</Text>
      <Pressable onPress={() => {supabase.auth.signOut(); router.push("/login") }}>
        <Text style={styles.text}>Sign Out</Text>
      </Pressable>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});