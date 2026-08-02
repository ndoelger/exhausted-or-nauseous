import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../utils/supabase";

type Props = {
  onCodeSent: (phone: string) => void;
};

const LoginForm = ({ onCodeSent }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  // Send SMS OTP, then hand off to the code entry screen
  const handleSubmit = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Please enter a valid phone number");
      return;
    }

    const phone = `+1${phoneNumber}`;
    console.log("[auth] sending OTP to", phone);

    try {
      const { error, data } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      console.log("[auth] OTP sent", data);
      onCodeSent(phone);
    } catch (error) {
      console.error("[auth] OTP send failed", error);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>ENTER YOUR PHONE NUMBER</Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.countryCode, { marginRight: 8 }]}>
          <Text style={styles.countryCodeText}>+1</Text>
        </View>
        <TextInput
          autoCapitalize="none"
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="PHONE NUMBER"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>SEND CODE</Text>
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
  countryCode: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryCodeText: {
    ...font.bold,
    fontSize: 16,
    color: colors.black,
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
