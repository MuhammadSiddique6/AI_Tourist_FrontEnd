import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radii, shadows } from "../constants/theme";

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
};

export function PressableCard({
  children,
  style,
  accentColor = colors.primary,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn: PressableProps["onPressIn"] = (e) => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps["onPressOut"] = (e) => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View
        style={[
          styles.card,
          { borderLeftColor: accentColor },
          style,
          { transform: [{ scale }] },
          disabled && styles.disabled,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    ...shadows.elevated,
  },
  disabled: { opacity: 0.6 },
});
