import { font } from "@/fonts";
import LoginForm from "@/components/login-form";
import VerifyOtpForm from "@/components/verify-otp-form";
import { colors, type } from "@/theme";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Login = () => {
  const insets = useSafeAreaInsets();
  // After OTP is sent, show the code entry form for this E.164 phone
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

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
      <Text style={styles.brand}>E🥱O🤢N</Text>
      <Text style={styles.tagline}>EXHAUSTED OR NAUSEOUS</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        {pendingPhone ? (
          <VerifyOtpForm
            phone={pendingPhone}
            onBack={() => setPendingPhone(null)}
          />
        ) : (
          <LoginForm onCodeSent={setPendingPhone} />
        )}
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
    fontSize: 64,
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
});
