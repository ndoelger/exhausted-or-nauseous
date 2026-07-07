import Search from "@/components/search";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Profile } from ".";
import { supabase } from "../../utils/supabase";

interface Props {
  profile: Profile;
  updateEmotion: (emotion: "Exhausted" | "Nauseous") => void;
}

const Home = ({ profile, updateEmotion }: Props) => {
  return (
    <View style={styles.container}>
      <Search />
      <Text style={styles.text}>{profile.firstName}</Text>
      <Text style={styles.text}>{profile.lastName}</Text>
      <Text style={styles.text}>{profile.email}</Text>
      <Text style={styles.text}>{profile.username}</Text>
      <Text style={styles.text}>{profile.id}</Text>
      <Pressable
        onPress={() => {
          supabase.auth.signOut();
          router.push("/login");
        }}
      >
        <Text style={styles.text}>Sign Out</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          updateEmotion("Exhausted");
          console.log("Exhausted");
        }}
        style={
          profile.emotion === "Exhausted"
            ? styles.buttonSelected
            : styles.button
        }
      >
        <Text style={styles.text}>Exhausted 🥱</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          updateEmotion("Nauseous");
          console.log("Nauseous");
        }}
        style={
          profile.emotion === "Nauseous" ? styles.buttonSelected : styles.button
        }
      >
        <Text style={styles.text}>Nauseous 🤢</Text>
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
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 5,
    margin: 5,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSelected: {
    backgroundColor: "lightgreen",
    padding: 10,
    borderRadius: 5,
    margin: 5,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
});
