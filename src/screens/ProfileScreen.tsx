import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radii, shadows } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { isAdminUser } from "../types/auth";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import type { Landmark } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type ProfNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Profile">,
  StackNavigationProp<AppStackParamList>
>;

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { saved, removeLandmark } = useSavedLandmarks();
  const navigation = useNavigation<ProfNav>();

  const openLandmark = (item: Landmark) => {
    navigation.navigate("Detail", { landmark: item });
  };

  const openAdmin = () => {
    navigation.navigate("AdminUsers");
  };

  const showAdmin = isAdminUser(user);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>
      </View>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName ?? "?").slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.displayName ?? "Traveler"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {showAdmin ? (
        <TouchableOpacity
          style={styles.adminCard}
          onPress={openAdmin}
          activeOpacity={0.9}
        >
          <View style={styles.adminIcon}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminTitle}>Admin panel</Text>
            <Text style={styles.adminSub}>View, block, or delete users</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved landmarks</Text>
        <Text style={styles.sectionCount}>{saved.length}</Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          saved.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="images-outline"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No saves yet</Text>
            <Text style={styles.emptyText}>
              Scan a site from the camera tab and tap Save.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => openLandmark(item)}
            activeOpacity={0.9}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSub}>
                {item.category} · {item.confidence}% confidence
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeLandmark(item.id)}
              hitSlop={12}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <PrimaryButton
        title="Sign out"
        variant="outline"
        onPress={logout}
        style={styles.signOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 18 },
  headerRow: { marginBottom: 16 },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  pageTitle: { fontSize: 28, fontWeight: "900", color: colors.text },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 14,
    ...shadows.elevated,
  },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    ...shadows.elevated,
  },
  adminIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  adminTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  adminSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: colors.primary },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  sectionCount: {
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  list: { paddingBottom: 100, gap: 10 },
  emptyList: { flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    ...shadows.soft,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  rowSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: 20,
  },
  signOut: { marginVertical: 16 },
});
