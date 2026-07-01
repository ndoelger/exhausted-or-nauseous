import { Profile } from "@/app/index";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

import { devSignup } from "@/dev/fixtures/auth";

interface Props {
  setProfile: (profile: Profile) => void;
}

const SignupForm = ({ setProfile }: Props) => {
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
      const { data, error } = await supabase.auth.signUp({
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

      if (error) {
        throw error;
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      return;
    }

    setUserInput({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      confirmEmail: "",
      password: "",
    });

    router.push("/");
  };

  return (
    <View style={styles.form}>
      {__DEV__ && (
        <Pressable onPress={() => setUserInput(devSignup)}>
          <Text>Fill test data</Text>
        </Pressable>
      )}

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
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Enter</Text>
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
