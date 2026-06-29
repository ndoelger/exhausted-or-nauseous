import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function LoginForm() {
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
  });

  const handleInput = (field: string) => (value: string) => {
    setUserInput({ ...userInput, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userInput.email,
        password: userInput.password,
      });
      if (error) throw error;
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        autoCapitalize='none'
        keyboardType='email-address'
        placeholder='Email'
        placeholderTextColor='#888'
        style={styles.input}
        value={userInput.email}
        onChangeText={handleInput("email")}
      />

      <TextInput
        autoCapitalize='none'
        placeholder='Password'
        placeholderTextColor='#888'
        secureTextEntry
        style={styles.input}
        value={userInput.password}
        onChangeText={handleInput("password")}
      />

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Enter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    gap: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    fontSize: 16,
    color: "#000",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  pressed: {
    opacity: 0.7,
  },
});
