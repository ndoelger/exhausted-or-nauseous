import Avatar from "@/components/avatar";
import { colors } from "@/theme";
import { type Profile } from "@/types/profile";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  FriendStatus,
  getFriendship,
  respondFriendRequest,
  sendFriendRequest,
  unfriend as unfriendRequest,
} from "../../utils/friends";

type Props = {
  user: Profile;
  myUserId: string;
  onClose: () => void;
};

const UserProfileModal = ({ user, myUserId, onClose }: Props) => {
  const [status, setStatus] = useState<FriendStatus>("none");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      const friendship = await getFriendship(myUserId, user.id);
      setStatus(friendship.status);
      setRequestId(friendship.requestId);
    };
    loadStatus();
  }, [user.id, myUserId]);

  const sendRequest = async () => {
    setLoading(true);
    const { data, error } = await sendFriendRequest(myUserId, user.id);
    if (error || !data) {
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
    const { error } = await respondFriendRequest(requestId, next);
    if (error) {
      console.error(error);
      alert("Failed to update friend request");
    } else {
      setStatus(next);
    }
    setLoading(false);
  };

  const handleUnfriend = async () => {
    if (!requestId) return;
    setLoading(true);
    const { error } = await unfriendRequest(requestId);
    if (error) {
      console.error(error);
      alert("Failed to unfriend");
    } else {
      setRequestId(null);
      setStatus("none");
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal transparent animationType='fade' visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Avatar
            uri={user.avatarUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size={72}
          />
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.meta}>@{user.username}</Text>
          {user.emotion && (
            <Text style={styles.emotion}>{user.emotion.toUpperCase()}</Text>
          )}

          {status === "none" && (
            <Pressable
              onPress={sendRequest}
              disabled={loading}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>ADD PEEP</Text>
            </Pressable>
          )}
          {status === "pending_sent" && (
            <Text style={styles.statusText}>SENT</Text>
          )}
          {status === "pending_received" && (
            <View style={styles.row}>
              <Pressable
                onPress={() => respondRequest("accepted")}
                disabled={loading}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>YES</Text>
              </Pressable>
              <Pressable
                onPress={() => respondRequest("rejected")}
                disabled={loading}
                style={styles.secondary}
              >
                <Text style={styles.secondaryText}>NO</Text>
              </Pressable>
            </View>
          )}
          {status === "accepted" && (
            <>
              <Text style={styles.statusText}>FRIENDS</Text>
              <Pressable
                onPress={handleUnfriend}
                disabled={loading}
                style={styles.unfriend}
              >
                <Text style={styles.unfriendText}>UNFRIEND</Text>
              </Pressable>
            </>
          )}
          {status === "rejected" && (
            <Text style={styles.statusText}>DECLINED</Text>
          )}

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>DONE</Text>
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
    backgroundColor: "rgba(108,52,131,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.black,
    marginTop: 12,
  },
  meta: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 4,
  },
  emotion: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.purple,
    marginTop: 10,
  },
  primary: {
    marginTop: 20,
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 1,
  },
  secondary: {
    marginTop: 20,
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.muted,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  statusText: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    color: colors.muted,
  },
  unfriend: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  unfriendText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.danger,
  },
  close: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.muted,
  },
});
