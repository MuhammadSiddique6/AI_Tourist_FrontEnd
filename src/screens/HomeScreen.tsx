import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableCard } from "../components/PressableCard";
import { ScreenBackground } from "../components/ScreenBackground";
import { accentPalette, colors, radii, shadows } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import { useLandmarks } from "../hooks/useLandmarks";
import { getLandmarkImageSource } from "../services/landmarkService";
import type { Landmark } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  StackNavigationProp<AppStackParamList>
>;

const LANDMARK_ACCENTS = [
  accentPalette.scan,
  accentPalette.map,
  accentPalette.saved,
  accentPalette.explore,
  accentPalette.highlight,
];

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
  const { landmarks, loading, error, refresh } = useLandmarks();
  const featuredLandmarks = useMemo(() => landmarks.slice(0, 3), [landmarks]);

  const scanScale = useRef(new Animated.Value(1)).current;
  const mapScale = useRef(new Animated.Value(1)).current;

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
    <ScreenBackground variant="home">
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                Welcome back, {user?.displayName ?? "Traveler"}
              </Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: colors.tertiaryMuted }]}>
              <Text style={[styles.avatarText, { color: colors.tertiary }]}>
                {(user?.displayName ?? "T").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Animated.View style={{ flex: 1, transform: [{ scale: scanScale }] }}>
              <TouchableOpacity
                style={[styles.actionCard, { borderLeftColor: accentPalette.scan.border }]}
                onPress={goToScan}
                onPressIn={() => handlePressIn(scanScale)}
                onPressOut={() => handlePressOut(scanScale)}
                activeOpacity={0.9}
              >
                <View style={[styles.actionIcon, { backgroundColor: accentPalette.scan.bg }]}>
                  <Ionicons name="camera" size={26} color={accentPalette.scan.fg} />
                </View>
                <Text style={styles.actionTitle}>Scan</Text>
                <Text style={styles.actionSub}>Identify landmarks</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ flex: 1, transform: [{ scale: mapScale }] }}>
              <TouchableOpacity
                style={[styles.actionCard, { borderLeftColor: accentPalette.map.border }]}
                onPress={goToMap}
                onPressIn={() => handlePressIn(mapScale)}
                onPressOut={() => handlePressOut(mapScale)}
                activeOpacity={0.9}
              >
                <View style={[styles.actionIcon, { backgroundColor: accentPalette.map.bg }]}>
                  <Ionicons name="map" size={26} color={accentPalette.map.fg} />
                </View>
                <Text style={styles.actionTitle}>Map</Text>
                <Text style={styles.actionSub}>Explore nearby</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tertiary }]}>
                {saved.length}
              </Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {landmarks.length}
              </Text>
              <Text style={styles.statLabel}>Landmarks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.coral }]}>
                {new Set(landmarks.map((l) => l.category)).size}
              </Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Landmarks</Text>
            <TouchableOpacity onPress={goToMap} activeOpacity={0.7}>
              <Text style={[styles.seeAll, { color: colors.accentDark }]}>
                See all →
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 24 }}
            />
          ) : null}

          {error ? (
            <View style={[styles.errorBox, { borderLeftColor: colors.danger }]}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={refresh} activeOpacity={0.8}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!loading && !error
            ? featuredLandmarks.map((landmark, index) => {
                const accent = LANDMARK_ACCENTS[index % LANDMARK_ACCENTS.length];
                return (
                  <PressableCard
                    key={landmark.id}
                    accentColor={accent.border}
                    onPress={() => openLandmark(landmark)}
                    style={[
                      styles.landmarkCard,
                      {
                        marginBottom:
                          index === featuredLandmarks.length - 1 ? 0 : 12,
                      },
                    ]}
                  >
                    <View style={styles.landmarkRow}>
                      <Image
                        source={getLandmarkImageSource(landmark)}
                        style={styles.landmarkImage}
                        contentFit="cover"
                      />
                      <View style={styles.landmarkInfo}>
                        <Text style={styles.landmarkName}>{landmark.name}</Text>
                        <View
                          style={[
                            styles.categoryPill,
                            { backgroundColor: accent.bg },
                          ]}
                        >
                          <Text style={[styles.landmarkCat, { color: accent.fg }]}>
                            {landmark.category}
                          </Text>
                        </View>
                        {landmark.summary ? (
                          <Text style={styles.landmarkSummary} numberOfLines={2}>
                            {landmark.summary}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.landmarkChevron}>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={accent.fg}
                        />
                      </View>
                    </View>
                  </PressableCard>
                );
              })
            : null}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  avatarText: { fontSize: 22, fontWeight: "900" },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
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
  statValue: { fontSize: 24, fontWeight: "900" },
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
  seeAll: { fontSize: 14, fontWeight: "700" },
  errorBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
  retryText: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  landmarkCard: { overflow: "hidden" },
  landmarkRow: { flexDirection: "row", alignItems: "center" },
  landmarkImage: { width: 100, height: 100 },
  landmarkInfo: { flex: 1, padding: 14, justifyContent: "center" },
  landmarkName: { fontSize: 16, fontWeight: "800", color: colors.text },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  landmarkCat: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  landmarkSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 17,
  },
  landmarkChevron: { paddingRight: 14, justifyContent: "center" },
});
