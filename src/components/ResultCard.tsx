import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { accentPalette, colors, radii, shadows } from "../constants/theme";
import type { ContentLanguage } from "../services/translationService";
import type { LandmarkRecognitionResult } from "../types/landmark";

type Props = {
  result: LandmarkRecognitionResult;
  onListen: (lang: ContentLanguage) => void;
  onTranslate: () => void;
  onSave: () => void;
  onDetails: () => void;
  saved: boolean;
};

export function ResultCard({
  result,
  onListen,
  onTranslate,
  onSave,
  onDetails,
  saved,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {result.name}
          </Text>
          <Text style={styles.confidence}>Confidence {result.confidence}%</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: accentPalette.map.bg }]}>
          <Ionicons name="sparkles" size={18} color={accentPalette.map.fg} />
        </View>
      </View>

      <View style={styles.listenRow}>
        <TouchableOpacity
          style={[styles.listenBtn, { backgroundColor: accentPalette.scan.bg }]}
          onPress={() => onListen("en")}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-high" size={18} color={accentPalette.scan.fg} />
          <Text style={[styles.listenLabel, { color: accentPalette.scan.fg }]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.listenBtn, { backgroundColor: accentPalette.map.bg }]}
          onPress={() => onListen("ur")}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-high" size={18} color={accentPalette.map.fg} />
          <Text style={[styles.listenLabel, { color: accentPalette.map.fg }]}>
            اردو
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: accentPalette.explore.bg }]}
          onPress={onTranslate}
          activeOpacity={0.8}
        >
          <Ionicons name="language" size={20} color={accentPalette.explore.fg} />
          <Text style={[styles.actionLabel, { color: accentPalette.explore.fg }]}>
            Translate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: accentPalette.saved.bg }]}
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={accentPalette.saved.fg}
          />
          <Text style={[styles.actionLabel, { color: accentPalette.saved.fg }]}>
            {saved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={onDetails}
        activeOpacity={0.9}
      >
        <Text style={styles.detailsText}>View details</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...shadows.elevated,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  confidence: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  listenRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  listenBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radii.md,
    ...shadows.soft,
  },
  listenLabel: { fontSize: 13, fontWeight: "800" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: radii.md,
    ...shadows.soft,
  },
  actionLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  detailsText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginRight: 4,
  },
});
