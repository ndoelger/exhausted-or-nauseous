import { Profile } from "@/app/index";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
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

  const initials =
    (editData.firstName?.[0] ?? "").toUpperCase() +
    (editData.lastName?.[0] ?? "").toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
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

    onClose();
  };

  const handleUploadPicture = async () => {
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
      if (!asset?.uri) return;

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
    } catch (e) {
      console.error(e);
      alert("Failed to upload picture");
    }
  };

  return (
    <Modal transparent animationType='fade' visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Profile</Text>
          {editData.avatarUrl ? (
            <Image source={{ uri: editData.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.label}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.meta}>@{profile.username}</Text>
          {profile.emotion && (
            <Text style={styles.emotion}>{profile.emotion}</Text>
          )}

          <Pressable
            onPress={() => setShowEditModal(true)}
            style={styles.close}
          >
            <Text style={styles.closeText}>Edit</Text>
          </Pressable>

          <Pressable onPress={handleSignOut} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {showEditModal && (
        <Modal
          transparent
          animationType='fade'
          visible
          onRequestClose={() => setShowEditModal(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setShowEditModal(false)}
          >
            <Pressable style={styles.card} onPress={() => {}}>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.label}>Profile Picture</Text>
              <Pressable style={styles.upload} onPress={handleUploadPicture}>
                {editData.avatarUrl ? (
                  <Image
                    source={{ uri: editData.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
              </Pressable>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={editData.firstName}
                onChangeText={(text) =>
                  setEditData({ ...editData, firstName: text })
                }
              />
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={editData.lastName}
                onChangeText={(text) =>
                  setEditData({ ...editData, lastName: text })
                }
              />
              <Pressable onPress={handleEdit} style={styles.save}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  meta: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emotion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  signOut: {
    marginTop: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c00",
  },
  close: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
  },
  save: {
    marginTop: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  upload: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarInitials: {
    fontSize: 32,
    color: "#aaa",
  },
});
