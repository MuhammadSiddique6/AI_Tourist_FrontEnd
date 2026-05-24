import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResultCard } from "../components/ResultCard";
import { ScannerOverlay } from "../components/ScannerOverlay";
import { colors, radii, shadows } from "../constants/theme";
import { useSavedLandmarks } from "../context/SavedLandmarksContext";
import { API_BASE_URL } from "../config";
import { recognizeLandmarkMock } from "../services/mockLandmarkService";
import api from "../services/api";
import { mockTranslateLandmark } from "../services/translateMock";
import { speakLandmarkSummary } from "../services/ttsService";
import type { LandmarkRecognitionResult } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";

type ScanNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Scan">,
  StackNavigationProp<AppStackParamList>
>;

export function ScanScreen() {
  const navigation = useNavigation<ScanNav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LandmarkRecognitionResult | null>(null);
  const { saveLandmark, isSaved } = useSavedLandmarks();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loading, pulse]);

  const onScan = useCallback(async () => {
    setResult(null);
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Camera permissions required", "Please allow camera access to scan landmarks.");
        return;
      }

      const photo = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });

      // Handle different response shapes across SDKs:
      // - older: { cancelled: boolean, uri: string }
      // - newer: { assets: [{ uri }] }
      let uri: string | undefined;
      if (Object.prototype.hasOwnProperty.call(photo, "cancelled")) {
        if ((photo as any).cancelled) return;
        uri = (photo as any).uri;
      } else if ((photo as any).assets && (photo as any).assets.length > 0) {
        uri = (photo as any).assets[0].uri;
      } else {
        uri = (photo as any).uri;
      }
      if (!uri) return;

      const file = { uri, name: "photo.jpg", type: "image/jpeg" };
      const res = await api.ai.recognize(file);

      // backend returns { prediction, landmark }
      const landmark = res.landmark;
      const prediction = res.prediction || {};

      const label = prediction.prediction || prediction.label;
      const confidence = prediction.confidence || prediction.score || 0;

      if (!landmark) {
        if (label && label !== "unknown") {
          Alert.alert(
            "Recognized",
            res.message ||
              `Detected "${String(label).replace(/_/g, " ")}" (${Math.round(confidence * 100)}% confidence), but it is not in the database yet.`,
          );
        } else {
          Alert.alert("No landmark", res.message || "Could not recognize the landmark.");
        }
        return;
      }

      const mapped: LandmarkRecognitionResult = {
        id: String(landmark.id),
        name: landmark.name,
        confidence: confidence || 0.9,
        summary: landmark.description || "",
        etiquette: "",
        history: "",
        coordinate: {
          latitude: Number(landmark.latitude) || 0,
          longitude: Number(landmark.longitude) || 0,
        },
        category: "nearby",
        distanceMeters: 0,
        imageUri: landmark.image_path ? `${API_BASE_URL}${landmark.image_path}` : "",
        translatedPreview: "",
      };

      setResult(mapped);
    } catch (err: any) {
      Alert.alert("Scan error", err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const openDetails = useCallback(() => {
    if (!result) return;
    navigation.navigate("Detail", { landmark: result });
  }, [navigation, result]);

  const onListen = useCallback(() => {
    if (!result) return;
    speakLandmarkSummary(result.summary);
  }, [result]);

  const onTranslate = useCallback(() => {
    if (!result) return;
    Alert.alert("Translation (mock)", mockTranslateLandmark(result));
  }, [result]);

  const onSave = useCallback(() => {
    if (!result) return;
    saveLandmark(result);
    Alert.alert("Saved", `${result.name} added to your collection.`);
  }, [result, saveLandmark]);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <Text style={styles.permissionTitle}>Camera access</Text>
        <Text style={styles.permissionText}>
          We use the camera to frame landmarks and run on-device style
          recognition in this demo.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>Allow camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      <View style={styles.dim} pointerEvents="none" />

      <ScannerOverlay />

      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <View style={styles.statusPill}>
          <Ionicons name="location-sharp" size={16} color={colors.primary} />
          <Text style={styles.statusText}>Lahore, Pakistan</Text>
          <View style={styles.dot} />
          <Text style={styles.offline}>Offline ready</Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <Animated.View
            style={[styles.loadingInner, { transform: [{ scale: pulse }] }]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingLabel}>Recognizing landmark…</Text>
          </Animated.View>
        </View>
      ) : null}

      <View style={styles.bottomArea}>
        {result ? (
          <ResultCard
            result={result}
            onListen={onListen}
            onTranslate={onTranslate}
            onSave={onSave}
            onDetails={openDetails}
            saved={isSaved(result.id)}
          />
        ) : (
          <Text style={styles.hint}>
            Tap the shutter to scan the framed area
          </Text>
        )}

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={styles.captureOuter}
            onPress={onScan}
            activeOpacity={0.9}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  center: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    gap: 6,
    ...{
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  },
  statusText: { fontSize: 13, fontWeight: "700", color: colors.text },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 4,
  },
  offline: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  hint: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  captureRow: { alignItems: "center", marginTop: 8 },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
  },
  loadingInner: {
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  loadingLabel: { marginTop: 12, fontWeight: "700", color: colors.text },
  permission: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
    ...shadows.elevated,
  },
  permissionBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
