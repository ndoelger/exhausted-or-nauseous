import { font } from "@/fonts";
import { colors } from "@/theme";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  uri?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  /** Circle outline around the placeholder (e.g. on purple bg) */
  strokeColor?: string;
};

const Avatar = ({
  uri,
  firstName,
  lastName,
  size = 40,
  strokeColor,
}: Props) => {
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
          ...(strokeColor
            ? { borderWidth: 2, borderColor: strokeColor }
            : null),
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
          ...(strokeColor
            ? { borderWidth: 2, borderColor: strokeColor }
            : null),
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
