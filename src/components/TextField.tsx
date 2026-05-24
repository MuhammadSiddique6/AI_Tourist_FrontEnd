import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors, radii } from "../constants/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  /** Shows eye toggle to reveal or hide password */
  isPassword?: boolean;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, style, isPassword, secureTextEntry, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const hidden = isPassword ? !visible : Boolean(secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, isPassword && styles.inputWithToggle, style]}
          secureTextEntry={hidden}
          autoCapitalize={isPassword ? "none" : rest.autoCapitalize}
          autoCorrect={isPassword ? false : rest.autoCorrect}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  inputRowError: { borderColor: colors.danger },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputWithToggle: {
    paddingRight: 8,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  error: { color: colors.danger, marginTop: 6, fontSize: 13 },
});
