import { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../utils/supabase";

export type UserProfile = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  emotion: "Exhausted" | "Nauseous" | null;
};

type FriendStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "rejected"
  | "self";

type Props = {
  user: UserProfile;
  onClose: () => void;
};

const UserProfileModal = ({ user, onClose }: Props) => {
  const [status, setStatus] = useState<FriendStatus>("none");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initials =
    (user.first_name?.[0] ?? "").toUpperCase() +
    (user.last_name?.[0] ?? "").toUpperCase();

  useEffect(() => {
    const loadStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const myId = session?.user?.id;
      if (!myId) return;

      if (myId === user.id) {
        setStatus("self");
        return;
      }

      const { data } = await supabase
        .from("friend_requests")
        .select("id, from_user, to_user, status")
        .or(
          `and(from_user.eq.${myId},to_user.eq.${user.id}),and(from_user.eq.${user.id},to_user.eq.${myId})`,
        )
        .maybeSingle();

      if (!data) {
        setStatus("none");
        setRequestId(null);
        return;
      }

      setRequestId(data.id);
      if (data.status === "accepted") {
        setStatus("accepted");
      } else if (data.status === "rejected") {
        setStatus("rejected");
      } else if (data.from_user === myId) {
        setStatus("pending_sent");
      } else {
        setStatus("pending_received");
      }
    };

    loadStatus();
  }, [user.id]);

  const sendRequest = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const myId = session?.user?.id;
    if (!myId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("friend_requests")
      .insert({ from_user: myId, to_user: user.id, status: "pending" })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      alert("Failed to send friend request");
    } else {
      setRequestId(data.id);
      setStatus("pending_sent");
    }
    setLoading(false);
  };

  const respondRequest = async (next: "accepted" | "rejected") => {
    if (!requestId) return;
    setLoading(true);

    const { error } = await supabase
      .from("friend_requests")
      .update({ status: next })
      .eq("id", requestId);

    if (error) {
      console.error(error);
      alert("Failed to update friend request");
    } else {
      setStatus(next);
    }
    setLoading(false);
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.meta}>@{user.username}</Text>
          {user.emotion && <Text style={styles.emotion}>{user.emotion}</Text>}

          {status === "none" && (
            <Pressable
              onPress={sendRequest}
              disabled={loading}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>Add Friend</Text>
            </Pressable>
          )}
          {status === "pending_sent" && (
            <Text style={styles.statusText}>Request sent</Text>
          )}
          {status === "pending_received" && (
            <View style={styles.row}>
              <Pressable
                onPress={() => respondRequest("accepted")}
                disabled={loading}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => respondRequest("rejected")}
                disabled={loading}
                style={styles.secondary}
              >
                <Text style={styles.secondaryText}>Reject</Text>
              </Pressable>
            </View>
          )}
          {status === "accepted" && (
            <Text style={styles.statusText}>Friends</Text>
          )}
          {status === "rejected" && (
            <Text style={styles.statusText}>Request declined</Text>
          )}

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UserProfileModal;

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
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 32,
    color: "#aaa",
  },
  name: {
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
  primary: {
    marginTop: 20,
    backgroundColor: "#208AEF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondary: {
    marginTop: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  close: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});
