import AnimatedModal from "@/components/animated-modal";
import Avatar from "@/components/avatar";
import { font } from "@/fonts";
import { colors } from "@/theme";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../utils/supabase";

type NotificationRow = {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  actor: {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = {
  profileId: string;
  onClose: () => void;
};

const NotificationsModal = ({ profileId, onClose }: Props) => {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        id,
        body,
        created_at,
        read_at,
        actor:profiles!notifications_actor_id_fkey(
          id, username, first_name, last_name, avatar_url
        )
      `,
      )
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const rows = (data ?? []).map((row) => ({
      ...row,
      actor: Array.isArray(row.actor) ? row.actor[0] : row.actor,
    })) as NotificationRow[];

    setItems(rows);
    setLoading(false);

    const unreadIds = rows.filter((r) => !r.read_at).map((r) => r.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);
    }
  };

  useEffect(() => {
    load();
  }, [profileId]);

  return (
    <AnimatedModal onClose={onClose} contentStyle={styles.card}>
      {(close) => (
        <>
          {loading ? (
            <Text style={styles.empty}>LOADING...</Text>
          ) : items.length === 0 ? (
            <Text style={styles.empty}>SILENCE</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <View style={[styles.row, !item.read_at && styles.rowUnread]}>
                  <View style={styles.avatarWrap}>
                    <Avatar
                      uri={item.actor?.avatar_url}
                      firstName={item.actor?.first_name}
                      lastName={item.actor?.last_name}
                      size={40}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.message}>{item.body}</Text>
                    <Text style={styles.meta}>@{item.actor?.username}</Text>
                  </View>
                </View>
              )}
            />
          )}

          <Pressable onPress={close} style={styles.close}>
            <Text style={styles.closeText}>DONE</Text>
          </Pressable>
        </>
      )}
    </AnimatedModal>
  );
};

export default NotificationsModal;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 24,
  },
  list: {
    maxHeight: 360,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowUnread: {
    backgroundColor: colors.cream,
  },
  avatarWrap: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  message: {
    ...font.black,
    fontSize: 15,
    color: colors.black,
  },
  meta: {
    ...font.medium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  empty: {
    ...font.black,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    paddingVertical: 16,
  },
  close: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    ...font.black,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.muted,
  },
});
