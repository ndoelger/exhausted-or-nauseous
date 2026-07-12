import AnimatedModal from "@/components/animated-modal";
import Avatar from "@/components/avatar";
import UserProfileModal from "@/components/user-profile-modal";
import { font } from "@/fonts";
import { colors, type } from "@/theme";
import { type Profile } from "@/types/profile";
import { useEffect, useState, type ReactElement } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import {
  listFriends,
  respondFriendRequest,
  type FriendRow,
} from "../../utils/friends";

type Props = {
  profileId: string;
  onClose: () => void;
};

const FriendsModal = ({ profileId, onClose }: Props) => {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [requests, setRequests] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const load = async () => {
    setLoading(true);
    const { friends: nextFriends, requests: nextRequests } =
      await listFriends(profileId);
    setFriends(nextFriends);
    setRequests(nextRequests);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [profileId]);

  const respondRequest = async (
    requestId: string,
    next: "accepted" | "rejected",
  ) => {
    const { error } = await respondFriendRequest(requestId, next);
    if (error) {
      console.error(error);
      alert("Failed to update friend request");
      return;
    }
    await load();
  };

  const renderPerson = (item: FriendRow, actions?: ReactElement | null) => (
    <Pressable style={styles.row} onPress={() => setSelectedUser(item.user)}>
      <View style={styles.avatarWrap}>
        <Avatar
          uri={item.user.avatarUrl}
          firstName={item.user.firstName}
          lastName={item.user.lastName}
          size={40}
        />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text style={styles.meta}>@{item.user.username}</Text>
        {item.user.emotion && (
          <Text style={styles.name}>{item.user.emotion}</Text>
        )}
      </View>
      {actions}
    </Pressable>
  );

  return (
    <>
      <AnimatedModal
        visible={!selectedUser}
        onClose={onClose}
        contentStyle={styles.card}
      >
        {(close) => (
          <>
            <Text style={styles.title}>FRIENDS</Text>

            {loading ? (
              <Text style={styles.empty}>LOADING...</Text>
            ) : (
              <>
                <Text style={styles.section}>REQUESTS</Text>
                {requests.length === 0 ? (
                  <Text style={styles.empty}>NONE</Text>
                ) : (
                  <FlatList
                    data={requests}
                    keyExtractor={(item) => item.requestId}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) =>
                      renderPerson(
                        item,
                        <View style={styles.actions}>
                          <Pressable
                            style={styles.accept}
                            onPress={() =>
                              respondRequest(item.requestId, "accepted")
                            }
                          >
                            <Text style={styles.acceptText}>YES</Text>
                          </Pressable>
                          <Pressable
                            style={styles.reject}
                            onPress={() =>
                              respondRequest(item.requestId, "rejected")
                            }
                          >
                            <Text style={styles.rejectText}>NO</Text>
                          </Pressable>
                        </View>,
                      )
                    }
                  />
                )}

                <Text style={styles.section}>FRIENDS</Text>
                {friends.length === 0 ? (
                  <Text style={styles.empty}>NONE YET</Text>
                ) : (
                  <FlatList
                    data={friends}
                    keyExtractor={(item) => item.requestId}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => renderPerson(item)}
                  />
                )}
              </>
            )}

            <Pressable onPress={close} style={styles.close}>
              <Text style={styles.closeText}>DONE</Text>
            </Pressable>
          </>
        )}
      </AnimatedModal>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          myUserId={profileId}
          onClose={() => {
            setSelectedUser(null);
            load();
          }}
        />
      )}
    </>
  );
};

export default FriendsModal;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 24,
  },
  title: {
    ...type.title,
    marginBottom: 12,
  },
  section: {
    ...font.black,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.muted,
    marginTop: 12,
    marginBottom: 8,
  },
  list: {
    maxHeight: 180,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrap: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  name: {
    ...font.black,
    fontSize: 16,
    color: colors.black,
  },
  meta: {
    ...font.medium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  accept: {
    backgroundColor: colors.purple,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  acceptText: {
    ...font.black,
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1,
  },
  reject: {
    backgroundColor: colors.cream,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  rejectText: {
    ...font.black,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
  },
  empty: {
    ...font.black,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    paddingVertical: 8,
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
