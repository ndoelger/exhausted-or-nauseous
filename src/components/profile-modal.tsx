import AnimatedModal from "@/components/animated-modal";
import Avatar from "@/components/avatar";
import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { type Profile } from "@/types/profile";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

type Props = {
  profile: Profile;
  onClose: () => void;
  setProfile: (profile: Profile) => void;
};

const ProfileModal = ({ profile, onClose, setProfile }: Props) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const [editData, setEditData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
  });

  const handleSignOut = async () => {
    // index onAuthStateChange clears profile and shows Login
    await supabase.auth.signOut();
    onClose();
  };

  const handleEdit = async () => {
    await supabase.auth.updateUser({
      data: {
        firstName: editData.firstName,
        lastName: editData.lastName,
      },
    });
    await supabase
      .from("profiles")
      .update({
        first_name: editData.firstName,
        last_name: editData.lastName,
      })
      .eq("id", profile.id);

    setProfile({
      ...profile,
      firstName: editData.firstName,
      lastName: editData.lastName,
      avatarUrl: editData.avatarUrl,
    });
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri) return;

    // React Native: ArrayBuffer works more reliably than Blob for Storage uploads
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
    // bust cache after overwrite
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", profile.id);

    if (updateError) throw updateError;

    setEditData((prev) => ({ ...prev, avatarUrl }));
    setProfile({ ...profile, avatarUrl });
  };

  const handlePickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await uploadAvatar(asset);
    } catch (e) {
      console.error(e);
      alert("Failed to upload picture");
    }
  };

  const handleTakePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to use the camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await uploadAvatar(asset);
    } catch (e) {
      console.error(e);
      alert("Failed to take picture");
    }
  };

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

  return (
    <AnimatedModal onClose={onClose} contentStyle={styles.card}>
      {() =>
        showEditModal ? (
          <>
            <Text style={styles.title}>EDIT</Text>
            <Text style={styles.fieldLabel}>PICTURE</Text>
            <Pressable style={styles.upload} onPress={handlePicturePress}>
              <Avatar
                uri={editData.avatarUrl}
                firstName={editData.firstName}
                lastName={editData.lastName}
                size={72}
              />
              <Text style={styles.pictureHint}>TAP TO CHANGE</Text>
            </Pressable>
            <Text style={styles.fieldLabel}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={editData.firstName}
              onChangeText={(text) =>
                setEditData({ ...editData, firstName: text })
              }
            />
            <Text style={styles.fieldLabel}>LAST NAME</Text>
            <TextInput
              style={styles.input}
              value={editData.lastName}
              onChangeText={(text) =>
                setEditData({ ...editData, lastName: text })
              }
            />
            <Pressable
              onPress={async () => {
                await handleEdit();
                setShowEditModal(false);
              }}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>SAVE</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowEditModal(false)}
              style={styles.signOut}
            >
              <Text style={styles.secondaryText}>BACK</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>ME</Text>
            <Avatar
              uri={editData.avatarUrl}
              firstName={editData.firstName}
              lastName={editData.lastName}
              size={72}
            />
            <Text style={styles.label}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.meta}>@{profile.username}</Text>
            {profile.emotion && (
              <Text style={styles.emotion}>{profile.emotion.toUpperCase()}</Text>
            )}

            <Pressable
              onPress={() => setShowEditModal(true)}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>EDIT</Text>
            </Pressable>

            <Pressable onPress={handleSignOut} style={styles.signOut}>
              <Text style={styles.signOutText}>SIGN OUT</Text>
            </Pressable>
          </>
        )
      }
    </AnimatedModal>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 24,
  },
  title: {
    ...type.title,
    marginBottom: 12,
  },
  label: {
    ...font.black,
    fontSize: 20,
    color: colors.black,
    marginTop: 12,
  },
  fieldLabel: {
    ...font.black,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 12,
    marginBottom: 6,
  },
  meta: {
    ...font.bold,
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  emotion: {
    ...font.black,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.purple,
    marginTop: 10,
  },
  primary: {
    marginTop: 20,
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    ...font.black,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 1,
  },
  secondary: {
    marginTop: 20,
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: {
    ...font.black,
    fontSize: 14,
    color: colors.black,
    letterSpacing: 1,
  },
  signOut: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: {
    ...font.black,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.danger,
  },
  input: {
    ...font.bold,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  upload: {
    paddingVertical: 8,
    alignItems: "flex-start",
    gap: 8,
  },
  pictureHint: {
    ...font.black,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
});
