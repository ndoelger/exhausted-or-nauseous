import AnimatedModal from "@/components/animated-modal";
import { FONT_OPTIONS } from "@/fonts";
import { colors } from "@/theme";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * DEV-only font comparer. Explicit fontFamily on each sample (no global patch).
 */
const FontPicker = () => {
  const [open, setOpen] = useState(false);

  if (!__DEV__) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      >
        <Text style={styles.chipText}>
          COMPARE FONTS ({FONT_OPTIONS.length})
        </Text>
      </Pressable>

      <AnimatedModal
        visible={open}
        onClose={() => setOpen(false)}
        contentStyle={styles.sheet}
      >
        {(close) => (
          <>
            <Text style={styles.title}>FONTS</Text>
            <Text style={styles.hint}>
              Scroll to compare · {FONT_OPTIONS.length} loaded
            </Text>
            <FlatList
              data={FONT_OPTIONS}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
              renderItem={({ item: f }) => (
                <View style={styles.row}>
                  <Text
                    style={{
                      fontFamily: f.weights.black,
                      fontSize: 36,
                      color: colors.black,
                    }}
                  >
                    EO•N
                  </Text>
                  <Text
                    style={{
                      fontFamily: f.weights.bold,
                      fontSize: 20,
                      color: colors.black,
                      marginTop: 4,
                    }}
                  >
                    EXHAUSTED · NAUSEOUS
                  </Text>
                  <Text
                    style={{
                      fontFamily: f.weights.regular,
                      fontSize: 16,
                      color: colors.muted,
                      marginTop: 4,
                    }}
                  >
                    Alice is Exhausted 🥱
                  </Text>
                  <Text style={styles.rowLabel}>{f.label.toUpperCase()}</Text>
                </View>
              )}
            />
            <Pressable onPress={close} style={styles.done}>
              <Text style={styles.doneText}>DONE</Text>
            </Pressable>
          </>
        )}
      </AnimatedModal>
    </>
  );
};

export default FontPicker;

const styles = StyleSheet.create({
  chip: {
    alignSelf: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 8,
  },
  chipText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.black,
  },
  hint: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.purple,
  },
  done: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.muted,
  },
});
