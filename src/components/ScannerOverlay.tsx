import { Dimensions, StyleSheet, View } from "react-native";
import { colors } from "../constants/theme";

const { width: W, height: H } = Dimensions.get("window");
const BOX_W = W * 0.78;
const BOX_H = 240;
const BORDER = 3;
const LEN = 28;

export function ScannerOverlay() {
  const left = (W - BOX_W) / 2;
  const top = (H - BOX_H) / 2 - 40;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.cornerTL, { left, top }]} />
      <View style={[styles.cornerTR, { left: left + BOX_W - LEN, top }]} />
      <View style={[styles.cornerBL, { left, top: top + BOX_H - LEN }]} />
      <View style={[styles.cornerBR, { left: left + BOX_W - LEN, top: top + BOX_H - LEN }]} />
      <View style={[styles.frame, { left, top, width: BOX_W, height: BOX_H }]} />
    </View>
  );
}

const cornerCommon = {
  position: "absolute" as const,
  width: LEN,
  height: LEN,
  borderColor: colors.scannerFrame,
};

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    borderWidth: BORDER,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  cornerTL: {
    ...cornerCommon,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    ...cornerCommon,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    ...cornerCommon,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    ...cornerCommon,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
    borderBottomRightRadius: 14,
  },
});
