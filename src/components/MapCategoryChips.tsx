import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  HOTEL_MAP_COLOR,
  MAP_FILTER_LABELS,
  type MapFilterId,
} from "../constants/mapFilters";
import { colors, radii, shadows } from "../constants/theme";

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
          const isHotel = item.id === "hotels";
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[
                styles.chip,
                selected && styles.chipActive,
                selected && isHotel && styles.chipHotelActive,
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={
                  selected
                    ? "#fff"
                    : isHotel
                      ? HOTEL_MAP_COLOR
                      : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.label,
                  selected && styles.labelActive,
                  !selected && isHotel && styles.labelHotel,
                ]}
              >
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: 8,
    ...shadows.elevated,
  },
  chipActive: { backgroundColor: colors.primary },
  chipHotelActive: { backgroundColor: HOTEL_MAP_COLOR },
  label: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
  labelActive: { color: "#fff" },
  labelHotel: { color: HOTEL_MAP_COLOR },
});
