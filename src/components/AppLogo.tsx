import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, shadows } from "../constants/theme";

const logoSource = require("../../assets/images/logo.png");

type Props = {
  size?: "sm" | "md" | "lg" | "hero";
  showRing?: boolean;
  style?: ViewStyle;
};

const SIZES = {
  sm: 48,
  md: 72,
  lg: 96,
  hero: 120,
};

export function AppLogo({ size = "md", showRing = true, style }: Props) {
  const dim = SIZES[size];
  const ringPad = showRing ? 12 : 0;
  const outer = dim + ringPad;

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          showRing && styles.ring,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
          },
        ]}
      >
        <Image
          source={logoSource}
          style={{ width: dim, height: dim }}
          contentFit="contain"
          accessibilityLabel="App logo"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.accent,
    ...shadows.soft,
  },
});
