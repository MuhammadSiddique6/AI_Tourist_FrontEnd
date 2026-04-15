import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii } from "../constants/theme";

export type DetailTab = "summary" | "etiquette" | "history";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "etiquette", label: "Etiquette" },
  { id: "history", label: "History" },
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
            style={[styles.tab, on && styles.tabOn]}
            onPress={() => onChange(t.id)}
            activeOpacity={0.9}
          >
            <Text style={[styles.text, on && styles.textOn]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radii.sm,
  },
  tabOn: { backgroundColor: colors.surface, ...{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 } },
  text: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  textOn: { color: colors.primary },
});
