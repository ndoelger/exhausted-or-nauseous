import FriendsModal from "@/components/friends-modal";
import NotificationsModal from "@/components/notifications-modal";
import ProfileModal from "@/components/profile-modal";
import Search from "@/components/search";
import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { type Profile } from "@/types/profile";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

const exhaustedImg = require("../../assets/emotions/exhausted.png");
const nauseousImg = require("../../assets/emotions/nauseous.png");

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
  const noteOpacity = useRef(new Animated.Value(0)).current;
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    };
  }, []);

  // Ping friends, show note for 5s, then fade out (slot stays reserved so circles don't jump)
  const handleEmotion = (emotion: "Exhausted" | "Nauseous") => {
    console.log("[home] emotion tap", emotion);
    updateEmotion(emotion);

    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteOpacity.setValue(1);
    noteTimer.current = setTimeout(() => {
      console.log("[home] fading confirmation note");
      Animated.timing(noteOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

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
          <Pressable
            onPress={() => setShowNotificationsModal(true)}
            style={({ pressed }) => [styles.navHit, pressed && styles.pressed]}
          >
          </Pressable>
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
        {/* <FontPicker /> */}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => handleEmotion("Exhausted")}
          style={({ pressed }) => [
            styles.yoButton,
            pressed && styles.yoButtonPressed,
          ]}
        >
          <Image source={exhaustedImg} style={styles.yoEmoji} />
        </Pressable>
        <Pressable
          onPress={() => handleEmotion("Nauseous")}
          style={({ pressed }) => [
            styles.yoButton,
            pressed && styles.yoButtonPressed,
          ]}
        >
          <Image source={nauseousImg} style={styles.yoEmoji} />
        </Pressable>
        <View style={styles.noteSlot}>
          <Animated.Text style={[styles.note, { opacity: noteOpacity }]}>
            we let them know.
          </Animated.Text>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 28,
  },
  yoButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  // Green only while finger is down
  yoButtonPressed: {
    backgroundColor: colors.yellow,
    transform: [{ scale: 0.96 }],
  },
  // ~76% of 200px circle — image centers cleanly unlike emoji Text
  yoEmoji: {
    width: 170,
    height: 170,
  },
  // Fixed height so showing/hiding the note never shifts the circles
  noteSlot: {
    height: 28,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  note: {
    ...font.black,
    color: colors.white,
    fontSize: 16,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
