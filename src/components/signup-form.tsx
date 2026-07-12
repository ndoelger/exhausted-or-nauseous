import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { devSignup } from "@/dev/fixtures/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

const SignupForm = () => {
  const [userInput, setUserInput] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    confirmEmail: "",
    password: "",
  });

  const handleInput = (field: string) => (value: string) => {
    setUserInput({ ...userInput, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      // onAuthStateChange in index loads profile after sign-up (when session exists)
      const { error } = await supabase.auth.signUp({
        email: userInput.email,
        password: userInput.password,
        options: {
          data: {
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            username: userInput.username,
          },
        },
      });
      if (error) throw error;

      setUserInput({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        confirmEmail: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.form}>
      {__DEV__ && (
        <Pressable onPress={() => setUserInput(devSignup)}>
          <Text style={styles.devFill}>FILL TEST DATA</Text>
        </Pressable>
      )}

      <Text style={styles.title}>SIGN UP</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="FIRST NAME"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={userInput.firstName}
        onChangeText={handleInput("firstName")}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="LAST NAME"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={userInput.lastName}
        onChangeText={handleInput("lastName")}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="USERNAME"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={userInput.username}
        onChangeText={handleInput("username")}
      />
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
        keyboardType="email-address"
        placeholder="CONFIRM EMAIL"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={userInput.confirmEmail}
        onChangeText={handleInput("confirmEmail")}
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
        <Text style={styles.buttonText}>SIGN UP</Text>
      </Pressable>
    </View>
  );
};

export default SignupForm;

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
  devFill: {
    ...font.black,
    color: colors.yellow,
    fontSize: 11,
    letterSpacing: 1,
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
