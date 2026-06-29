import LoginForm from "@/components/login-form";
import SignupForm from "@/components/signup-form";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: insets.left + 24,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        {isLogin ? <LoginForm /> : <SignupForm />}
        <View style={styles.form}>
          <Pressable
            onPress={() => setIsLogin(!isLogin)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>
              {isLogin ? "Sign up" : "Log in"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  wrapper: {
    width: "100%",
    gap: 16,
  },
  form: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    gap: 16,
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
