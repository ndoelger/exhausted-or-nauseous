import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

type SearchResult = {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
};

const Search = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

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

    let query = supabase
      .from("profiles")
      .select("username, first_name, last_name");

    if (last) {
      query = query
        .ilike("last_name", `%${last}%`)
        .ilike("first_name", `%${first}%`);
    } else {
      query = query.or(
        `username.ilike.%${text.trim()}%,first_name.ilike.%${text.trim()}%,last_name.ilike.%${text.trim()}%`,
      );
    }

    const { data } = await query.limit(20);

    console.log(data);

    setResults(data ?? []);
    setLoading(false);
  };

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => (open ? closeSearch() : setOpen(true))}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Text style={styles.toggleText}>
          {open ? "Close search" : "Search"}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.panel}>
          <TextInput
            autoCapitalize='none'
            autoFocus
            placeholder='Search users...'
            placeholderTextColor='#888'
            style={styles.input}
            value={query}
            onChangeText={searchUsers}
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.username ?? ""}
            style={styles.list}
            ListEmptyComponent={
              query.trim() ? (
                <Text style={styles.empty}>No users found</Text>
              ) : loading ? (
                <Text style={styles.empty}>Loading...</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.result}>
                <Text style={styles.resultName}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.resultMeta}>@{item.username}</Text>
              </View>
            )}
          />
        </View>
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
  },
  toggle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 16,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  pressed: {
    opacity: 0.7,
  },
  panel: {
    marginTop: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 12,
    maxHeight: 320,
  },
  input: {
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  result: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  resultMeta: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  list: {
    marginTop: 12,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 12,
  },
});
