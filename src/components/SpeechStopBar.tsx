import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows } from "../constants/theme";
import { useSpeech } from "../context/SpeechContext";

type Props = {
  style?: object;
};

export function SpeechStopBar({ style }: Props) {
  const { isSpeaking, activeLanguage, stop } = useSpeech();

  if (!isSpeaking) return null;

  const label =
    activeLanguage === "ur" ? "اردو سن رہے ہیں…" : "Playing in English…";

  return (
    <View style={[styles.bar, style]}>
      <View style={styles.left}>
        <Ionicons name="volume-high" size={20} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.stopBtn, pressed && styles.pressed]}
        onPress={stop}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Stop speaking"
      >
        <Ionicons name="stop-circle" size={18} color="#fff" />
        <Text style={styles.stopText}>Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.soft,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
    flexShrink: 1,
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  pressed: { opacity: 0.88 },
  stopText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
