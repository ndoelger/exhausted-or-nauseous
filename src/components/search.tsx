import Avatar from "@/components/avatar";
import UserProfileModal from "@/components/user-profile-modal";
import { font } from "@/fonts";
import { colors } from "@/theme";
import { mapProfile, type Profile } from "@/types/profile";
import { useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { supabase } from "../../utils/supabase";

type Props = {
  myUserId: string;
};

const Search = ({ myUserId }: Props) => {
  const inputRef = useRef<TextInput>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const opacity = useSharedValue(0);

  const showOverlay = () => {
    setOpen(true);
    opacity.value = withTiming(1, { duration: 180 });
  };

  const hideOverlay = () => {
    opacity.value = withTiming(0, { duration: 140 });
    setOpen(false);
  };

  const searchUsers = async (text: string) => {
    setLoading(true);
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const term = text.trim();
    const [first, ...rest] = term.split(/\s+/);
    const last = rest.join(" ");

    let dbQuery = supabase
      .from("profiles")
      .select(
        "id, username, first_name, last_name, avatar_url, emotion",
      );

    if (last) {
      dbQuery = dbQuery
        .ilike("last_name", `%${last}%`)
        .ilike("first_name", `%${first}%`);
    } else {
      dbQuery = dbQuery.or(
        `username.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`,
      );
    }

    const { data } = await dbQuery.limit(20);
    setResults((data ?? []).map(mapProfile));
    setLoading(false);
  };

  const closeSearch = () => {
    hideOverlay();
    setQuery("");
    setResults([]);
    setLoading(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const openUserProfile = (user: Profile) => {
    setSelectedUser(user);
    closeSearch();
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        autoCapitalize="none"
        placeholder="FIND FRIENDS"
        placeholderTextColor={colors.muted}
        style={styles.bar}
        value={query}
        onChangeText={(text) => {
          if (!open) showOverlay();
          searchUsers(text);
        }}
        onFocus={showOverlay}
      />

      {open && (
        <>
          {/* Dim layer over the rest of the screen — does not push layout */}
          <Animated.View
            style={[styles.backdrop, overlayStyle]}
            pointerEvents="auto"
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSearch} />
          </Animated.View>

          <Animated.View style={[styles.dropdown, overlayStyle]}>
            {loading ? (
              <Text style={styles.empty}>LOADING...</Text>
            ) : query.trim() && results.length === 0 ? (
              <Text style={styles.empty}>NOBODY HERE</Text>
            ) : results.length === 0 ? (
              <Text style={styles.empty}>TYPE A NAME</Text>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.result}
                    onPress={() => openUserProfile(item)}
                  >
                    <View style={styles.avatarWrap}>
                      <Avatar
                        uri={item.avatarUrl}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        size={32}
                      />
                    </View>
                    <View style={styles.resultText}>
                      <Text style={styles.resultName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.resultMeta}>@{item.username}</Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </Animated.View>
        </>
      )}

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          myUserId={myUserId}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    marginBottom: 12,
    zIndex: 20,
    overflow: "visible",
  },
  bar: {
    ...font.bold,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 3,
  },
  backdrop: {
    position: "absolute",
    top: "100%",
    left: -400,
    right: -400,
    height: 2000,
    marginTop: 0,
    backgroundColor: "rgba(15,26,46,0.72)",
    zIndex: 1,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: 240,
    overflow: "hidden",
    zIndex: 2,
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrap: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    ...font.black,
    fontSize: 16,
    color: colors.black,
  },
  resultMeta: {
    ...font.medium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  empty: {
    ...font.black,
    textAlign: "center",
    color: colors.muted,
    letterSpacing: 1,
    fontSize: 12,
    paddingVertical: 16,
  },
});
