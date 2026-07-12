import { font } from "@/fonts";
import { colors } from "@/theme";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  uri?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
};

const Avatar = ({ uri, firstName, lastName, size = 40 }: Props) => {
  const initials =
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {initials || "?"}
      </Text>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.purple,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    ...font.black,
    color: colors.white,
  },
});
