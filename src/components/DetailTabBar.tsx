import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, shadows } from "../constants/theme";

export type DetailTab = "summary" | "etiquette" | "history";

const TABS: {
  id: DetailTab;
  label: string;
  activeColor: string;
  activeBg: string;
}[] = [
  { id: "summary", label: "Summary", activeColor: colors.primary, activeBg: colors.primaryMuted },
  { id: "etiquette", label: "Etiquette", activeColor: colors.accentDark, activeBg: colors.accentMuted },
  { id: "history", label: "History", activeColor: colors.tertiary, activeBg: colors.tertiaryMuted },
];

type Props = {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
};

export function DetailTabBar({ active, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, on && [styles.tabOn, { backgroundColor: t.activeBg }]]}
            onPress={() => onChange(t.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.text, on && { color: t.activeColor, fontWeight: "800" }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radii.sm,
  },
  tabOn: { ...shadows.soft },
  text: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
});
