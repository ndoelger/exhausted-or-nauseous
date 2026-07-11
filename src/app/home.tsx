import ProfileModal from "@/components/profile-modal";
import Search from "@/components/search";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Profile } from ".";

interface Props {
  profile: Profile;
  updateEmotion: (emotion: "Exhausted" | "Nauseous") => void;
  setProfile: (profile: Profile) => void;
}

const Home = ({ profile, updateEmotion, setProfile }: Props) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.profileButtonWrap}>
        <Pressable
          onPress={() => setShowProfileModal(true)}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.profileButtonText}>👤</Text>
        </Pressable>
      </View>

      {showProfileModal && (
        <ProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <View style={styles.searchWrap}>
        <Search />
      </View>

      <View style={styles.actions}>
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
            profile.emotion === "Nauseous"
              ? styles.buttonSelected
              : styles.button
          }
        >
          <Text style={styles.text}>Nauseous 🤢</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  searchWrap: {
    width: "100%",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  actions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  profileButtonWrap: {
    position: "absolute",
    top: 36,
    left: 24,
    zIndex: 10,
  },
  profileButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  profileButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  pressed: {
    opacity: 0.7,
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
