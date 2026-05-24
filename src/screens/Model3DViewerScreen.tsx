import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LandmarkModelViewer } from "../components/LandmarkModelViewer";
import { colors } from "../constants/theme";
import { getLandmarkModelModule } from "../constants/landmarkModels";
import type { AppStackParamList } from "../types/navigation";

type Route = RouteProp<AppStackParamList, "Model3DViewer">;
type Nav = StackNavigationProp<AppStackParamList, "Model3DViewer">;

const HEADER_HEIGHT = 56;

export function Model3DViewerScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { landmark } = params;
  const modelKey = landmark.slug ?? landmark.name;

  const modelModule = useMemo(
    () => getLandmarkModelModule(modelKey),
    [modelKey],
  );
  const [error, setError] = useState<string | null>(
    modelModule ? null : "No 3D model is available for this landmark yet.",
  );

  const handleModelError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    navigation.navigate("MainTabs");
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", handleBack);
      return () => sub.remove();
    }, [handleBack]),
  );

  const headerPadTop = insets.top + 8;
  const footerPadBottom = insets.bottom + 8;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.viewer,
          {
            marginTop: headerPadTop + HEADER_HEIGHT,
            marginBottom: footerPadBottom + 36,
          },
        ]}
      >
        {error ? (
          <View style={styles.centered}>
            <Ionicons
              name="cube-outline"
              size={48}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={handleBack}>
              <Text style={styles.retryText}>Go back</Text>
            </Pressable>
          </View>
        ) : null}

        {modelModule && !error ? (
          <LandmarkModelViewer
            modelModule={modelModule}
            onError={handleModelError}
          />
        ) : null}

        {!modelModule && !error ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>

      <View
        style={[styles.header, { paddingTop: headerPadTop }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
          onPress={handleBack}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <View style={styles.titleBlock} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>
            {landmark.name}
          </Text>
          <Text style={styles.subtitle}>3D model · drag to explore</Text>
        </View>
      </View>

      {modelModule && !error ? (
        <View
          style={[styles.footer, { paddingBottom: footerPadBottom }]}
          pointerEvents="none"
        >
          <Text style={styles.hint}>
            Pinch to zoom · one finger to rotate
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1f1c",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 100,
    elevation: 100,
    backgroundColor: "rgba(26, 31, 28, 0.92)",
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  titleBlock: { flex: 1, marginLeft: 10 },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  viewer: {
    flex: 1,
    backgroundColor: "#1a1f1c",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 8,
    zIndex: 100,
    elevation: 100,
    backgroundColor: "rgba(26, 31, 28, 0.85)",
  },
  hint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "600",
  },
});
