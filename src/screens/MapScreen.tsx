import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapCategoryChips } from "../components/MapCategoryChips";
import { colors, radii, shadows } from "../constants/theme";
import {
    filterLandmarksByCategory,
    getAllLandmarks,
    type MapFilterId,
} from "../services/mockLandmarkService";
import type { Landmark } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";

type MapNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Map">,
  StackNavigationProp<AppStackParamList>
>;

const LAHORE = {
  latitude: 31.5826,
  longitude: 74.3276,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export function MapScreen() {
  const navigation = useNavigation<MapNav>();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<MapFilterId>("all");
  const all = useMemo(() => getAllLandmarks(), []);
  const visible = useMemo(
    () => filterLandmarksByCategory(all, filter),
    [all, filter],
  );

  const openDetail = (landmark: Landmark) => {
    navigation.navigate("Detail", { landmark });
  };

  const bottomPad = 56 + insets.bottom;

  return (
    <View style={styles.root}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={LAHORE}>
        {visible.map((lm) => (
          <Marker
            key={lm.id}
            coordinate={lm.coordinate}
            title={lm.name}
            description={`${lm.category} · mock`}
            onCalloutPress={() => openDetail(lm)}
            onPress={() => openDetail(lm)}
          />
        ))}
      </MapView>

      <MapCategoryChips active={filter} onChange={setFilter} />

      <View style={[styles.footer, { bottom: bottomPad }]}>
        <View style={styles.titlePill}>
          <Text style={styles.screenTitle}>Heritage map</Text>
          <Text style={styles.screenSub}>Tap a pin for cultural context</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  footer: {
    position: "absolute",
    left: 14,
    right: 14,
  },
  titlePill: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    ...shadows.elevated,
  },
  screenTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  screenSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
