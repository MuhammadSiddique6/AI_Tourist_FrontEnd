import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DetailTabBar, type DetailTab } from "../components/DetailTabBar";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radii, shadows } from "../constants/theme";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import { speakLandmarkSummary, stopSpeaking } from "../services/ttsService";
import { mockTranslateLandmark } from "../services/translateMock";
import type { AppStackParamList } from "../types/navigation";

type Route = RouteProp<AppStackParamList, "Detail">;
type Nav = StackNavigationProp<AppStackParamList, "Detail">;

export function DetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { landmark } = params;
  const [tab, setTab] = useState<DetailTab>("summary");
  const { saveLandmark, isSaved } = useSavedLandmarks();

  const body = useMemo(() => {
    if (tab === "summary") return landmark.summary;
    if (tab === "etiquette") return landmark.etiquette;
    return landmark.history;
  }, [landmark, tab]);

  const listen = () => {
    stopSpeaking();
    speakLandmarkSummary(body);
  };

  const translate = () => {
    Alert.alert("Translation (mock)", mockTranslateLandmark(landmark));
  };

  const download = () => {
    saveLandmark(landmark);
    Alert.alert(
      "Download (mock)",
      "An offline audio and text bundle for this landmark would be saved to your device."
    );
  };

  const distKm = (landmark.distanceMeters / 1000).toFixed(landmark.distanceMeters >= 1000 ? 1 : 2);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image source={{ uri: landmark.imageUri }} style={styles.headerImage} contentFit="cover" />
        <View style={styles.headerFade} />
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {landmark.name}
            </Text>
            <Text style={styles.distance}>
              {landmark.distanceMeters >= 1000
                ? `${distKm} km away · mock GPS`
                : `${Math.round(landmark.distanceMeters)} m away · mock GPS`}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <DetailTabBar active={tab} onChange={setTab} />

        <View style={styles.card}>
          <Text style={styles.cardBody}>{body}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Listen" onPress={listen} style={styles.actionBtn} />
          <PrimaryButton title="Translate" variant="outline" onPress={translate} style={styles.actionBtn} />
          <PrimaryButton title="Download" variant="outline" onPress={download} style={styles.actionBtn} />
        </View>

        {isSaved(landmark.id) ? (
          <Text style={styles.savedNote}>Already in your saved landmarks.</Text>
        ) : null}
      </ScrollView>
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
  headerSafe: { flex: 1, paddingHorizontal: 12, justifyContent: "space-between" },
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
  distance: { color: "rgba(255,255,255,0.9)", marginTop: 6, fontSize: 14, fontWeight: "600" },
  scroll: { padding: 18, paddingBottom: 36 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 18,
    ...shadows.card,
  },
  cardBody: { fontSize: 16, lineHeight: 24, color: colors.text },
  actions: { gap: 10 },
  actionBtn: { width: "100%" },
  savedNote: {
    marginTop: 14,
    textAlign: "center",
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
