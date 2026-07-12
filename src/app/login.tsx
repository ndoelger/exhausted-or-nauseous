import { font } from "@/fonts";
import LoginForm from "@/components/login-form";
import SignupForm from "@/components/signup-form";
import { colors, type } from "@/theme";
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

const Login = () => {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        },
      ]}
    >
      <Text style={styles.brand}>EO•N</Text>
      <Text style={styles.tagline}>EXHAUSTED OR NAUSEOUS</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        {isLogin ? <LoginForm /> : <SignupForm />}
        <Pressable
          onPress={() => setIsLogin(!isLogin)}
          style={({ pressed }) => [styles.switch, pressed && styles.pressed]}
        >
          <Text style={styles.switchText}>
            {isLogin ? "NO ACCOUNT? SIGN UP" : "HAVE AN ACCOUNT? LOG IN"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple,
  },
  brand: {
    ...type.hero,
    color: colors.white,
    textAlign: "center",
    fontSize: 72,
  },
  tagline: {
    ...font.black,
    color: colors.white,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 40,
    opacity: 0.9,
  },
  wrapper: {
    width: "100%",
    gap: 16,
  },
  switch: {
    alignItems: "center",
    paddingVertical: 16,
  },
  switchText: {
    ...font.black,
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
