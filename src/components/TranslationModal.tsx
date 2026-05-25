import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BilingualContent } from "../services/translationService";
import { colors, radii, shadows } from "../constants/theme";

type Props = {
  visible: boolean;
  loading: boolean;
  content: BilingualContent | null;
  title?: string;
  onClose: () => void;
};

export function TranslationModal({
  visible,
  loading,
  content,
  title = "Translation",
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Preparing English & Urdu…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.block, styles.blockEn]}>
              <View style={styles.labelRow}>
                <Ionicons name="language" size={18} color={colors.secondary} />
                <Text style={styles.label}>English</Text>
              </View>
              <Text style={styles.bodyEn}>{content?.english ?? "—"}</Text>
            </View>

            <View style={[styles.block, styles.blockUr]}>
              <View style={styles.labelRow}>
                <Ionicons name="language" size={18} color={colors.accentDark} />
                <Text style={styles.label}>اردو (Urdu)</Text>
              </View>
              <Text style={styles.bodyUr}>{content?.urdu ?? "—"}</Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: colors.text },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  scroll: { padding: 18, paddingBottom: 32, gap: 14 },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderLeftWidth: 4,
    ...shadows.soft,
  },
  blockEn: { borderLeftColor: colors.secondary },
  blockUr: { borderLeftColor: colors.accentDark },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  label: { fontSize: 14, fontWeight: "800", color: colors.text },
  bodyEn: { fontSize: 16, lineHeight: 24, color: colors.text },
  bodyUr: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
