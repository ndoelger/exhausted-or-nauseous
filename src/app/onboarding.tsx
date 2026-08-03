import Avatar from "@/components/avatar";
import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { type Profile } from "@/types/profile";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

type Props = {
  profile: Profile;
  onComplete: (profile: Profile) => void;
};

const Onboarding = ({ profile, onComplete }: Props) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(profile.username ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Optional profile picture — same upload path as profile edit
  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri) return;

    console.log("[onboarding] uploading avatar");
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    const ext = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType =
      asset.mimeType ?? `image/${ext === "jpg" ? "jpeg" : ext}`;
    const filePath = `user-${profile.id}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);
    if (updateError) throw updateError;

    setAvatarUrl(url);
    console.log("[onboarding] avatar saved");
  };

  const handlePickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access photos is required");
        return;
      }

      console.log("[onboarding] opening photo library");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await uploadAvatar(asset);
    } catch (error) {
      console.error("[onboarding] library pick failed", error);
      Alert.alert("Failed to upload picture");
    }
  };

  const handleTakePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to use the camera is required");
        return;
      }

      console.log("[onboarding] opening camera");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await uploadAvatar(asset);
    } catch (error) {
      console.error("[onboarding] camera capture failed", error);
      Alert.alert("Failed to take picture");
    }
  };

  // Choose: library or camera → then upload to storage
  const handlePicturePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePicture();
          if (buttonIndex === 2) handlePickFromLibrary();
        },
      );
      return;
    }

    Alert.alert("Profile picture", undefined, [
      { text: "Take Photo", onPress: handleTakePicture },
      { text: "Choose from Library", onPress: handlePickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 0 &&
    !saving;

  const handleContinue = async () => {
    const first = firstName.trim();
    const last = lastName.trim();
    const user = username.trim().toLowerCase();
    if (!first || !last || !user) {
      Alert.alert("First name, last name, and username are required");
      return;
    }

    setSaving(true);
    console.log("[onboarding] saving profile");
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { firstName: first, lastName: last, username: user },
      });
      if (authError) throw authError;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: first,
          last_name: last,
          username: user,
        })
        .eq("id", profile.id);
      if (error) throw error;

      onComplete({
        ...profile,
        firstName: first,
        lastName: last,
        username: user,
        avatarUrl: avatarUrl ?? profile.avatarUrl,
      });
      console.log("[onboarding] complete");
    } catch (error) {
      console.error("[onboarding] save failed", error);
      Alert.alert("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

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
        <View style={styles.form}>
          <Text style={styles.title}>SET UP YOUR PROFILE</Text>

          <Pressable
            style={styles.picture}
            onPress={handlePicturePress}
          >
            <Avatar
              uri={avatarUrl}
              firstName={firstName}
              lastName={lastName}
              size={88}
              strokeColor={colors.white}
            />
            <Text style={styles.pictureHint}>ADD PHOTO (OPTIONAL)</Text>
          </Pressable>

          <TextInput
            autoCapitalize="words"
            placeholder="FIRST NAME"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            autoCapitalize="words"
            placeholder="LAST INITIAL"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="USERNAME"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && canContinue && styles.pressed,
              !canContinue && styles.disabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.buttonText}>
              {saving ? "SAVING…" : "CONTINUE"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Onboarding;

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
  picture: {
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  pictureHint: {
    ...font.black,
    color: colors.white,
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.85,
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
  disabled: {
    opacity: 0.6,
  },
});
