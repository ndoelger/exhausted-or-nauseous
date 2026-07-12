import Avatar from "@/components/avatar";
import UserProfileModal from "@/components/user-profile-modal";
import { colors } from "@/theme";
import { mapProfile, type Profile } from "@/types/profile";
import { useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
      .select("id, username, first_name, last_name, avatar_url, emotion, email");

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
    setOpen(false);
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

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => setOpen(true)}>
        <TextInput
          editable={false}
          pointerEvents="none"
          placeholder="FIND PEEPS"
          placeholderTextColor={colors.muted}
          style={styles.bar}
          value={query}
        />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="none"
        onRequestClose={closeSearch}
      >
        <Pressable style={styles.backdrop} onPress={closeSearch}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <TextInput
              ref={inputRef}
              autoFocus
              autoCapitalize="none"
              placeholder="FIND PEEPS"
              placeholderTextColor={colors.muted}
              style={styles.bar}
              value={query}
              onChangeText={searchUsers}
            />

            <View style={styles.dropdown}>
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
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(108,52,131,0.55)",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },
  bar: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: 240,
    overflow: "hidden",
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
    fontSize: 16,
    fontWeight: "800",
    color: colors.black,
  },
  resultMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
    paddingVertical: 16,
  },
});
