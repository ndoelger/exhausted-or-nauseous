import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

type Props = {
  phone: string;
  onBack: () => void;
};

const VerifyOtpForm = ({ phone, onBack }: Props) => {
  const [code, setCode] = useState("");

  // Confirm the SMS code and create a session
  const handleSubmit = async () => {
    if (code.length !== 6) {
      Alert.alert("Please enter the 6-digit code");
      return;
    }

    console.log("[auth] verifying OTP for", phone);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      console.log("[auth] OTP verified");
    } catch (error) {
      console.error("[auth] OTP verify failed", error);
      Alert.alert("Invalid code. Try again.");
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>ENTER YOUR CODE</Text>

      <TextInput
        autoCapitalize="none"
        autoFocus
        keyboardType="number-pad"
        maxLength={6}
        placeholder="6-DIGIT CODE"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>VERIFY</Text>
      </Pressable>

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>CHANGE PHONE NUMBER</Text>
      </Pressable>
    </View>
  );
};

export default VerifyOtpForm;

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
  back: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    ...font.black,
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
