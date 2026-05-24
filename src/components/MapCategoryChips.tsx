import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors, radii, shadows } from "../constants/theme";
import { MAP_FILTER_LABELS, type MapFilterId } from "../constants/mapFilters";

type Props = {
  active: MapFilterId;
  onChange: (id: MapFilterId) => void;
};

export function MapCategoryChips({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {MAP_FILTER_LABELS.map((item) => {
          const selected = active === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[styles.chip, selected && styles.chipActive]}
              activeOpacity={0.85}
            >
              <Text style={[styles.label, selected && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  row: {
    paddingVertical: 4,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: 8,
    ...shadows.elevated,
  },
  chipActive: { backgroundColor: colors.primary },
  label: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
  labelActive: { color: "#fff" },
});
