import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "../constants/theme";

type Variant = "default" | "auth" | "home" | "profile" | "admin";

type Props = {
  children: ReactNode;
  variant?: Variant;
  style?: ViewStyle;
};

/** Top tint per screen — pure RN views (no native gradient module). */
const VARIANT_TINTS: Record<Variant, { top: string; bottom: string }> = {
  default: { top: colors.gradientStart, bottom: colors.gradientEnd },
  auth: { top: colors.authGradientTop, bottom: colors.authGradientBottom },
  home: { top: colors.homeGradientTop, bottom: colors.secondaryMuted },
  profile: { top: colors.profileGradientTop, bottom: colors.accentMuted },
  admin: { top: colors.adminGradientTop, bottom: colors.adminGradientBottom },
};

export function ScreenBackground({
  children,
  variant = "default",
  style,
}: Props) {
  const tint = VARIANT_TINTS[variant];

  return (
    <View style={[styles.root, style]}>
      <View
        pointerEvents="none"
        style={[styles.tintTop, { backgroundColor: tint.top }]}
      />
      <View
        pointerEvents="none"
        style={[styles.tintBottom, { backgroundColor: tint.bottom }]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tintTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    opacity: 0.55,
  },
  tintBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "28%",
    opacity: 0.4,
  },
  content: { flex: 1 },
});
