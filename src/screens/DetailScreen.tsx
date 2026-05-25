import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { TranslationModal } from "../components/TranslationModal";
import { normalizeLandmarkKey } from "../constants/landmarkImages";
import { hasLandmark3dImage } from "../constants/landmark3dImages";
import { hasLandmarkModel } from "../constants/landmarkModels";
import { colors, radii, shadows } from "../constants/theme";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import { useBilingualLandmark } from "../hooks/useBilingualLandmark";
import { getLandmarkImageSource } from "../services/landmarkService";
import type { AppStackParamList } from "../types/navigation";

type Route = RouteProp<AppStackParamList, "Detail">;
type Nav = StackNavigationProp<AppStackParamList, "Detail">;

export function DetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { landmark } = params;
  const { saveLandmark, isSaved } = useSavedLandmarks();
  const {
    translationVisible,
    translating,
    bilingual,
    openTranslation,
    closeTranslation,
    listen,
  } = useBilingualLandmark();

  const summary = landmark.summary;

  const speechOptions = useMemo(
    () => ({
      landmarkName: landmark.name,
      slug: landmark.slug,
      urduPreview: landmark.translatedPreview,
      section: "summary" as const,
    }),
    [landmark.name, landmark.slug, landmark.translatedPreview],
  );

  const download = () => {
    saveLandmark(landmark);
    Alert.alert(
      "Download",
      "An offline audio and text bundle for this landmark would be saved to your device.",
    );
  };

  const hasDistance = landmark.distanceMeters > 0;
  const distKm = (landmark.distanceMeters / 1000).toFixed(
    landmark.distanceMeters >= 1000 ? 1 : 2,
  );
  const landmarkKey = landmark.slug ?? normalizeLandmarkKey(landmark.name);
  const canView3DModel = hasLandmarkModel(landmarkKey);
  const canView3DImage = hasLandmark3dImage(landmarkKey);

  const open3DViewer = () => {
    navigation.navigate("Model3DViewer", {
      landmark: { ...landmark, slug: landmarkKey },
    });
  };

  const open3DImage = () => {
    navigation.navigate("Landmark3DImage", {
      landmark: { ...landmark, slug: landmarkKey },
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image
          source={getLandmarkImageSource(landmark)}
          style={styles.headerImage}
          contentFit="cover"
        />
        <View style={styles.headerFade} />
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {landmark.name}
            </Text>
            {hasDistance ? (
              <Text style={styles.distance}>
                {landmark.distanceMeters >= 1000
                  ? `${distKm} km away`
                  : `${Math.round(landmark.distanceMeters)} m away`}
              </Text>
            ) : (
              <Text style={styles.distance}>{landmark.category}</Text>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Summary</Text>
          <Text style={styles.cardBody}>{summary}</Text>
        </View>

        <View style={styles.actions}>
          {canView3DModel ? (
            <PrimaryButton
              title="View 3D Model"
              colorVariant="tertiary"
              onPress={open3DViewer}
              style={styles.actionBtn}
            />
          ) : null}
          {canView3DImage ? (
            <PrimaryButton
              title="View 3D Image"
              colorVariant="secondary"
              onPress={open3DImage}
              style={styles.actionBtn}
            />
          ) : null}
          <View style={styles.listenRow}>
            <PrimaryButton
              title="Listen · English"
              variant="outline"
              colorVariant="secondary"
              onPress={() => listen(summary, "en", speechOptions)}
              style={styles.listenBtn}
            />
            <PrimaryButton
              title="سنیں · اردو"
              variant="outline"
              colorVariant="accent"
              onPress={() => listen(summary, "ur", speechOptions)}
              style={styles.listenBtn}
            />
          </View>
          <PrimaryButton
            title="Translate (English & Urdu)"
            variant="outline"
            colorVariant="accent"
            onPress={() => openTranslation(summary, speechOptions)}
            style={styles.actionBtn}
          />
          <PrimaryButton
            title="Download"
            variant="outline"
            colorVariant="secondary"
            onPress={download}
            style={styles.actionBtn}
          />
        </View>

        {isSaved(landmark.id) ? (
          <Text style={styles.savedNote}>Already in your saved landmarks.</Text>
        ) : null}
      </ScrollView>

      <TranslationModal
        visible={translationVisible}
        loading={translating}
        content={bilingual}
        title={landmark.name}
        onClose={closeTranslation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { height: 260, backgroundColor: "#000" },
  headerImage: { ...StyleSheet.absoluteFillObject },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  headerSafe: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  headerTextBlock: { paddingBottom: 18, paddingHorizontal: 8 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900" },
  distance: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  scroll: { padding: 18, paddingBottom: 36 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...shadows.elevated,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  cardBody: { fontSize: 16, lineHeight: 24, color: colors.text },
  actions: { gap: 10 },
  listenRow: { flexDirection: "row", gap: 10 },
  listenBtn: { flex: 1 },
  actionBtn: { width: "100%" },
  savedNote: {
    marginTop: 14,
    textAlign: "center",
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
