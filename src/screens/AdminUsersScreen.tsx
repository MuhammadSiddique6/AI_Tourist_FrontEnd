import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, shadows } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import {
  deleteAdminUser,
  fetchAdminUsers,
  setUserBlocked,
} from "../services/adminService";
import type { AdminUser } from "../types/admin";
import type { AppStackParamList } from "../types/navigation";

type Nav = StackNavigationProp<AppStackParamList, "AdminUsers">;

export function AdminUsersScreen() {
  const navigation = useNavigation<Nav>();
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const isSelf = useCallback(
    (item: AdminUser) => currentUser?.id === item.id,
    [currentUser?.id],
  );

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const list = await fetchAdminUsers();
      setUsers(list);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not load users";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  const confirmBlockToggle = (target: AdminUser) => {
    if (isSelf(target)) {
      Alert.alert("Not allowed", "You cannot block your own admin account.");
      return;
    }

    const willBlock = !target.isBlocked;
    Alert.alert(
      willBlock ? "Block user?" : "Unblock user?",
      willBlock
        ? `${target.name} will not be able to sign in.`
        : `${target.name} will be able to use the app again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: willBlock ? "Block" : "Unblock",
          style: willBlock ? "destructive" : "default",
          onPress: () => handleBlockToggle(target, willBlock),
        },
      ],
    );
  };

  const handleBlockToggle = async (target: AdminUser, blocked: boolean) => {
    setActionId(target.id);
    try {
      await setUserBlocked(target.id, blocked);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id ? { ...u, isBlocked: blocked } : u,
        ),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      Alert.alert("Error", message);
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = (target: AdminUser) => {
    if (isSelf(target)) {
      Alert.alert("Not allowed", "You cannot delete your own admin account.");
      return;
    }

    Alert.alert(
      "Delete user?",
      `Permanently remove ${target.name} (${target.email})? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(target),
        },
      ],
    );
  };

  const handleDelete = async (target: AdminUser) => {
    setActionId(target.id);
    try {
      await deleteAdminUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      Alert.alert("Error", message);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  const renderUser = ({ item }: { item: AdminUser }) => {
    const busy = actionId === item.id;
    const self = isSelf(item);

    return (
      <View style={[styles.card, self && styles.cardSelf]}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {self ? (
                <View style={styles.youBadge}>
                  <Text style={styles.youText}>You</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
              {item.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Unverified</Text>
                </View>
              )}
              {item.isBlocked ? (
                <View style={styles.blockedBadge}>
                  <Text style={styles.blockedText}>Blocked</Text>
                </View>
              ) : (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </View>
            {item.createdAt ? (
              <Text style={styles.joined}>Joined {formatDate(item.createdAt)}</Text>
            ) : null}
          </View>
        </View>

        {self ? (
          <Text style={styles.selfNote}>
            Admin accounts cannot be blocked or deleted from this panel.
          </Text>
        ) : (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                item.isBlocked ? styles.unblockBtn : styles.blockBtn,
                pressed && styles.actionPressed,
                busy && styles.actionDisabled,
              ]}
              onPress={() => confirmBlockToggle(item)}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={item.isBlocked ? "checkmark-circle" : "ban"}
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.actionBtnText}>
                    {item.isBlocked ? "Unblock" : "Block"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.deleteBtn,
                pressed && styles.actionPressed,
                busy && styles.actionDisabled,
              ]}
              onPress={() => confirmDelete(item)}
              disabled={busy}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionBtnText, styles.deleteText]}>
                Delete
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconPressed]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}

        <View style={styles.headerText}>
          <Text style={styles.title}>Admin panel</Text>
          <Text style={styles.subtitle}>
            {currentUser?.displayName ?? "Admin"} · manage users
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconPressed]}
          onPress={logout}
          hitSlop={12}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {users.filter((u) => u.isBlocked).length}
          </Text>
          <Text style={styles.statLabel}>Blocked</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>Loading users…</Text>
        </View>
      ) : null}

      {error && !loading ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadUsers()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={
            users.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadUsers(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  iconBtnPlaceholder: { width: 44 },
  iconPressed: { opacity: 0.85 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "900", color: colors.text },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 14,
    alignItems: "center",
    ...shadows.soft,
  },
  statValue: { fontSize: 22, fontWeight: "900", color: colors.primary },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyList: { flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    ...shadows.elevated,
  },
  cardSelf: { borderWidth: 1.5, borderColor: colors.primaryMuted },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: colors.primary },
  cardBody: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  userName: { fontSize: 17, fontWeight: "800", color: colors.text },
  youBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  youText: { fontSize: 11, fontWeight: "800", color: colors.primary },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  joined: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: "600",
  },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  roleBadge: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textTransform: "capitalize",
  },
  verifiedBadge: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  verifiedText: { fontSize: 12, fontWeight: "700", color: colors.success },
  pendingBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  pendingText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  blockedBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  blockedText: { fontSize: 12, fontWeight: "700", color: colors.danger },
  activeBadge: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  activeText: { fontSize: 12, fontWeight: "700", color: colors.success },
  selfNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  blockBtn: { backgroundColor: "#B45309" },
  unblockBtn: { backgroundColor: colors.primary },
  deleteBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  actionBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  deleteText: { color: colors.danger },
  actionPressed: { opacity: 0.9 },
  actionDisabled: { opacity: 0.6 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    textAlign: "center",
    color: colors.danger,
    fontWeight: "600",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  retryText: { color: "#fff", fontWeight: "800" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
});
