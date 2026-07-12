import FontPicker from "@/components/font-picker";
import FriendsModal from "@/components/friends-modal";
import NotificationsModal from "@/components/notifications-modal";
import ProfileModal from "@/components/profile-modal";
import Search from "@/components/search";
import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { type Profile } from "@/types/profile";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

interface Props {
  profile: Profile;
  updateEmotion: (emotion: "Exhausted" | "Nauseous") => void;
  setProfile: (profile: Profile) => void;
}

const Home = ({ profile, updateEmotion, setProfile }: Props) => {
  const insets = useSafeAreaInsets();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnread = async () => {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null);

    if (error) {
      console.error(error);
      return;
    }
    setUnreadCount(count ?? 0);
  };

  useEffect(() => {
    loadUnread();
  }, [profile.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View style={styles.topSide}>
          <Pressable
            onPress={() => setShowProfileModal(true)}
            style={({ pressed }) => [styles.navHit, pressed && styles.pressed]}
          >
            <Text style={styles.navLabel}>ME</Text>
          </Pressable>
        </View>

        <Text style={styles.brand}>E🥱O🤢N</Text>

        <View style={[styles.topSide, styles.topRight]}>
          {/* <Pressable
            onPress={() => setShowNotificationsModal(true)}
            style={({ pressed }) => [styles.navHit, pressed && styles.pressed]}
          >
            <Text style={styles.navLabel}>YO</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable> */}
          <Pressable
            onPress={() => setShowFriendsModal(true)}
            style={({ pressed }) => [styles.navHit, pressed && styles.pressed]}
          >
            <Text style={styles.navLabel}>FRIENDS</Text>
          </Pressable>
        </View>
      </View>

      {showProfileModal && (
        <ProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showFriendsModal && (
        <FriendsModal
          profileId={profile.id}
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          profileId={profile.id}
          onClose={() => {
            setShowNotificationsModal(false);
            loadUnread();
          }}
        />
      )}

      <View style={styles.searchWrap}>
        <Search myUserId={profile.id} />
        <FontPicker />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => updateEmotion("Exhausted")}
          style={({ pressed }) => [
            styles.yoButton,
            profile.emotion === "Exhausted" && styles.yoButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.yoButtonText}>EXHAUSTED</Text>
          <Text style={styles.yoEmoji}>🥱</Text>
        </Pressable>
        <Pressable
          onPress={() => updateEmotion("Nauseous")}
          style={({ pressed }) => [
            styles.yoButton,
            profile.emotion === "Nauseous" && styles.yoButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.yoButtonText}>NAUSEOUS</Text>
          <Text style={styles.yoEmoji}>🤢</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  brand: {
    ...type.title,
    color: colors.white,
    fontSize: 22,
    textAlign: "center",
  },
  topRight: {
    justifyContent: "flex-end",
    gap: 4,
  },
  navHit: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  navLabel: {
    ...font.black,
    color: colors.white,
    fontSize: 13,
    letterSpacing: 1,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    ...font.black,
    color: colors.black,
    fontSize: 9,
  },
  searchWrap: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
    zIndex: 20,
    overflow: "visible",
  },
  actions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    gap: 16,
  },
  prompt: {
    ...font.black,
    color: colors.white,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
    opacity: 0.85,
  },
  yoButton: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  yoButtonSelected: {
    backgroundColor: colors.yellow,
  },
  yoButtonText: {
    ...font.black,
    fontSize: 28,
    letterSpacing: 1,
    color: colors.black,
  },
  yoEmoji: {
    fontSize: 28,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
