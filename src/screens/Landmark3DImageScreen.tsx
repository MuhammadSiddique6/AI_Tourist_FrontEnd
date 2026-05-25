import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Image } from "expo-image";
import { useCallback } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getLandmark3dImageSource } from "../constants/landmark3dImages";
import { radii } from "../constants/theme";
import type { AppStackParamList } from "../types/navigation";

type Route = RouteProp<AppStackParamList, "Landmark3DImage">;
type Nav = StackNavigationProp<AppStackParamList, "Landmark3DImage">;

export function Landmark3DImageScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { landmark } = params;

  const imageSource = getLandmark3dImageSource(landmark.slug ?? landmark.name);

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

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={handleBack}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {landmark.name}
          </Text>
          <Text style={styles.subtitle}>3D image preview</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        centerContent
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.hint}>
          Pinch to zoom · Replace mock file in assets/images/3d/
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f1412" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  headerText: { flex: 1, marginLeft: 10 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 420,
    borderRadius: radii.lg,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  hint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "600",
  },
});
