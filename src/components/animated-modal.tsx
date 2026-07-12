import { useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const IN_MS = 220;
const OUT_MS = 160;

type Props = {
  /** Defaults to true (mount/unmount pattern). Toggle for keep-mounted sheets. */
  visible?: boolean;
  onClose: () => void;
  children: ReactNode | ((close: () => void) => ReactNode);
  contentStyle?: StyleProp<ViewStyle>;
  /** Centered card (default) or top sheet (search). */
  align?: "center" | "top";
};

/**
 * Fade + slight scale/slide open and close.
 * Call the `close` render-prop (or backdrop / back) so exit can finish before unmount.
 */
const AnimatedModal = ({
  visible = true,
  onClose,
  children,
  contentStyle,
  align = "center",
}: Props) => {
  const [mounted, setMounted] = useState(visible);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const translateY = useSharedValue(align === "top" ? -10 : 14);

  const animateIn = () => {
    opacity.value = withTiming(1, { duration: IN_MS });
    scale.value = withTiming(1, { duration: IN_MS });
    translateY.value = withTiming(0, { duration: IN_MS });
  };

  const animateOut = (then: () => void) => {
    opacity.value = withTiming(0, { duration: OUT_MS }, (finished) => {
      if (finished) runOnJS(then)();
    });
    scale.value = withTiming(0.94, { duration: OUT_MS });
    translateY.value = withTiming(align === "top" ? -8 : 10, {
      duration: OUT_MS,
    });
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = 0;
      scale.value = 0.94;
      translateY.value = align === "top" ? -10 : 14;
      animateIn();
    } else if (mounted) {
      animateOut(() => setMounted(false));
    }
  }, [visible]);

  const requestClose = () => {
    animateOut(onClose);
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  if (!mounted) return null;

  const body =
    typeof children === "function" ? children(requestClose) : children;

  return (
    <Modal
      transparent
      animationType="none"
      visible={mounted}
      onRequestClose={requestClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} />
        </Animated.View>

        <View
          style={align === "top" ? styles.top : styles.center}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[contentStyle, contentAnim]}
            pointerEvents="auto"
          >
            {body}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default AnimatedModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15,26,46,0.72)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1,
  },
  top: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 24,
    zIndex: 1,
  },
});
