import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignupForm() {
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

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        autoCapitalize='none'
        placeholder='First Name'
        placeholderTextColor='#888'
        style={styles.input}
        value={userInput.firstName}
        onChangeText={handleInput("firstName")}
      />
      <TextInput
        autoCapitalize='none'
        placeholder='Last Name'
        placeholderTextColor='#888'
        style={styles.input}
        value={userInput.lastName}
        onChangeText={handleInput("lastName")}
      />
      <TextInput
        autoCapitalize='none'
        placeholder='Username'
        placeholderTextColor='#888'
        style={styles.input}
        value={userInput.username}
        onChangeText={handleInput("username")}
      />
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
        keyboardType='email-address'
        placeholder='Confirm Email'
        placeholderTextColor='#888'
        style={styles.input}
        value={userInput.confirmEmail}
        onChangeText={handleInput("confirmEmail")}
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
