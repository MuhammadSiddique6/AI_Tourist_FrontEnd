import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from "react-native";
import { colors, radii, shadows } from "../constants/theme";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
};

export function PrimaryButton({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.base,
        isPrimary ? styles.primary : null,
        variant === "outline" ? styles.outline : null,
        variant === "ghost" ? styles.ghost : null,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <Text
          style={[
            styles.title,
            isPrimary ? styles.titleOnPrimary : null,
            variant === "outline" || variant === "ghost"
              ? styles.titleMuted
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
  primary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.soft,
  },
  ghost: { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
  disabled: { opacity: 0.55 },
  title: { fontSize: 16, fontWeight: "700" },
  titleOnPrimary: { color: "#fff" },
  titleMuted: { color: colors.primary },
});
