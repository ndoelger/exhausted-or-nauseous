import UserProfileModal, {
  UserProfile,
} from "@/components/user-profile-modal";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

type SearchResult = UserProfile & {
  username: string | null;
};

const Search = () => {
  const inputRef = useRef<TextInput>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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
      .select("id, username, first_name, last_name, avatar_url, emotion");

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
    setResults(data ?? []);
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

  const openUserProfile = (user: SearchResult) => {
    setSelectedUser(user);
    closeSearch();
  };

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => setOpen(true)}>
        <TextInput
          editable={false}
          pointerEvents="none"
          placeholder="Search users..."
          placeholderTextColor="#888"
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
              placeholder="Search users..."
              placeholderTextColor="#888"
              style={styles.bar}
              value={query}
              onChangeText={searchUsers}
            />

            <View style={styles.dropdown}>
              {loading ? (
                <Text style={styles.empty}>Loading...</Text>
              ) : query.trim() && results.length === 0 ? (
                <Text style={styles.empty}>No users found</Text>
              ) : results.length === 0 ? (
                <Text style={styles.empty}>Type to search</Text>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const initials =
                      (item.first_name?.[0] ?? "").toUpperCase() +
                      (item.last_name?.[0] ?? "").toUpperCase();

                    return (
                      <Pressable
                        style={styles.result}
                        onPress={() => openUserProfile(item)}
                      >
                        {item.avatar_url ? (
                          <Image
                            source={{ uri: item.avatar_url }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                              {initials}
                            </Text>
                          </View>
                        )}
                        <View style={styles.resultText}>
                          <Text style={styles.resultName}>
                            {item.first_name} {item.last_name}
                          </Text>
                          <Text style={styles.resultMeta}>
                            @{item.username}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
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
    backgroundColor: "rgba(0,0,0,0.25)",
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
    color: "#000",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    maxHeight: 240,
    overflow: "hidden",
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 14,
    color: "#aaa",
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  resultMeta: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 16,
  },
});
