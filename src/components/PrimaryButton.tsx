import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from "react-native";
import { colors, radii, shadows } from "../constants/theme";

type ColorVariant = "primary" | "accent" | "secondary" | "tertiary" | "coral";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "outline" | "ghost";
  colorVariant?: ColorVariant;
  loading?: boolean;
};

const FILLS: Record<ColorVariant, string> = {
  primary: colors.primary,
  accent: colors.accentDark,
  secondary: colors.secondary,
  tertiary: colors.tertiary,
  coral: colors.coral,
};

export function PrimaryButton({
  title,
  variant = "primary",
  colorVariant = "primary",
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const isFilled = variant === "primary";
  const fill = FILLS[colorVariant];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.base,
        isFilled ? { backgroundColor: fill } : null,
        variant === "outline"
          ? [styles.outline, { borderColor: fill }]
          : null,
        variant === "ghost" ? styles.ghost : null,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? "#fff" : fill} />
      ) : (
        <Text
          style={[
            styles.title,
            isFilled ? styles.titleOnPrimary : null,
            variant === "outline" || variant === "ghost"
              ? { color: fill }
              : null,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    ...shadows.soft,
  },
  ghost: { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
  disabled: { opacity: 0.55 },
  title: { fontSize: 16, fontWeight: "700" },
  titleOnPrimary: { color: "#fff" },
});
