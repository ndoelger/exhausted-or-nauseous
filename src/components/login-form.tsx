import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

const LoginForm = () => {
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
  });

  const handleInput = (field: string) => (value: string) => {
    setUserInput({ ...userInput, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userInput.email,
        password: userInput.password,
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>LOG IN</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="EMAIL"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={userInput.email}
        onChangeText={handleInput("email")}
      />

      <TextInput
        autoCapitalize="none"
        placeholder="PASSWORD"
        placeholderTextColor={colors.muted}
        secureTextEntry
        style={styles.input}
        value={userInput.password}
        onChangeText={handleInput("password")}
      />

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>LOG IN</Text>
      </Pressable>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    gap: 12,
  },
  title: {
    ...type.title,
    color: colors.white,
    marginBottom: 8,
  },
  input: {
    ...font.bold,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    paddingVertical: 18,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    ...font.black,
    fontSize: 22,
    color: colors.white,
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
