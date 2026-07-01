import { StyleSheet, Text, View } from "react-native";
import { Profile } from ".";

interface Props {
  profile: Profile;
}

const Home = ({ profile }: Props) => {
  return (
    <View>
      <Text style={styles.text}>{profile.firstName}</Text>
      <Text style={styles.text}>{profile.lastName}</Text>
      <Text style={styles.text}>{profile.email}</Text>
      <Text style={styles.text}>{profile.username}</Text>
      <Text style={styles.text}>{profile.id}</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});