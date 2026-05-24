import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, shadows } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import { getAllLandmarks } from "../services/mockLandmarkService";
import type { Landmark } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  StackNavigationProp<AppStackParamList>
>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { user } = useAuth();
  const { saved } = useSavedLandmarks();
  const featuredLandmarks = getAllLandmarks().slice(0, 3);

  const scanScale = useRef(new Animated.Value(1)).current;
  const mapScale = useRef(new Animated.Value(1)).current;
  const statsScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const openLandmark = (landmark: Landmark) => {
    navigation.navigate("Detail", { landmark });
  };

  const goToScan = () => {
    navigation.navigate("Scan" as never);
  };

  const goToMap = () => {
    navigation.navigate("Map" as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              Welcome back, {user?.displayName ?? "Traveler"}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.displayName ?? "T").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Animated.View style={{ flex: 1, transform: [{ scale: scanScale }] }}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={goToScan}
              onPressIn={() => handlePressIn(scanScale)}
              onPressOut={() => handlePressOut(scanScale)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.primaryMuted },
                ]}
              >
                <Ionicons name="camera" size={26} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Scan</Text>
              <Text style={styles.actionSub}>Identify landmarks</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ flex: 1, transform: [{ scale: mapScale }] }}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={goToMap}
              onPressIn={() => handlePressIn(mapScale)}
              onPressOut={() => handlePressOut(mapScale)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.accentMuted },
                ]}
              >
                <Ionicons name="map" size={26} color={colors.accent} />
              </View>
              <Text style={styles.actionTitle}>Map</Text>
              <Text style={styles.actionSub}>Explore nearby</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Stats */}
        <Animated.View
          style={[styles.statsCard, { transform: [{ scale: statsScale }] }]}
        >
          <TouchableOpacity
            style={styles.statItem}
            onPressIn={() => handlePressIn(statsScale)}
            onPressOut={() => handlePressOut(statsScale)}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>{saved.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{featuredLandmarks.length}</Text>
            <Text style={styles.statLabel}>Nearby</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </Animated.View>

        {/* Featured Landmarks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Landmarks</Text>
          <TouchableOpacity onPress={goToMap} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {featuredLandmarks.map((landmark, index) => (
          <TouchableOpacity
            key={landmark.id}
            style={[
              styles.landmarkCard,
              { marginBottom: index === featuredLandmarks.length - 1 ? 0 : 12 },
            ]}
            onPress={() => openLandmark(landmark)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: landmark.imageUri }}
              style={styles.landmarkImage}
              contentFit="cover"
            />
            <View style={styles.landmarkInfo}>
              <Text style={styles.landmarkName}>{landmark.name}</Text>
              <Text style={styles.landmarkCat}>{landmark.category}</Text>
              <View style={styles.landmarkRow}>
                <Ionicons name="location" size={14} color={colors.primary} />
                <Text style={styles.landmarkDist}>
                  {landmark.distanceMeters >= 1000
                    ? `${(landmark.distanceMeters / 1000).toFixed(1)} km`
                    : `${landmark.distanceMeters} m`}{" "}
                  away
                </Text>
              </View>
            </View>
            <View style={styles.landmarkChevron}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 18, paddingBottom: 36 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: colors.textSecondary, fontWeight: "600" },
  userName: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "900",
    marginTop: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: colors.primary },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.elevated,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  actionSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 24,
    ...shadows.elevated,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "900", color: colors.primary },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: "600",
  },
  statDivider: { width: 1, backgroundColor: colors.border },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  seeAll: { fontSize: 14, fontWeight: "700", color: colors.primary },
  landmarkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 12,
    ...shadows.elevated,
  },
  landmarkImage: { width: 100, height: 100 },
  landmarkInfo: { flex: 1, padding: 14, justifyContent: "center" },
  landmarkName: { fontSize: 16, fontWeight: "800", color: colors.text },
  landmarkCat: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  landmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  landmarkDist: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  landmarkChevron: { paddingRight: 14, justifyContent: "center" },
});
