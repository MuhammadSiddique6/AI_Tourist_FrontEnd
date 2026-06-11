import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { formatHotelPrice } from "../constants/hotelMockDetails";
import { colors, radii, shadows } from "../constants/theme";
import type { NearbyHotel } from "../types/hotel";
import { formatDistance } from "../utils/geo";
import type { LatLng } from "../utils/geo";

type Props = {
  hotel: NearbyHotel;
  userLocation: LatLng | null;
  onClose: () => void;
  onShowRoute: () => void;
};

function buildDirectionsUrl(origin: LatLng, destination: LatLng): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&travelmode=driving`
  );
}

export function HotelDetailPanel({
  hotel,
  userLocation,
  onClose,
  onShowRoute,
}: Props) {
  const openExternalRoute = () => {
    if (!userLocation) return;
    const url = buildDirectionsUrl(userLocation, hotel.coordinate);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.panel}>
      <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>

      <Image
        source={
          hotel.imageSource ??
          require("../../assets/images/hotel_mock_1.jpg")
        }
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.body}>
        <Text style={styles.name}>{hotel.name}</Text>

        <View style={styles.metaRow}>
          {hotel.rating ? (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color={colors.accentDark} />
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          <Text style={styles.price}>{formatHotelPrice(hotel)}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="navigate-outline" size={18} color={colors.secondary} />
          <Text style={styles.rowText}>
            {formatDistance(hotel.distanceMeters)} from you
          </Text>
        </View>

        {hotel.address ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText} numberOfLines={2}>
              {hotel.address}
            </Text>
          </View>
        ) : null}

        {hotel.type ? (
          <View style={styles.row}>
            <Ionicons name="business-outline" size={18} color={colors.tertiary} />
            <Text style={styles.rowText}>{hotel.type}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.routeBtn, pressed && styles.pressed]}
          onPress={onShowRoute}
        >
          <Ionicons name="map-outline" size={20} color="#fff" />
          <Text style={styles.routeBtnText}>Show route on map</Text>
        </Pressable>

        {userLocation ? (
          <Pressable
            style={({ pressed }) => [
              styles.mapsBtn,
              pressed && styles.pressed,
            ]}
            onPress={openExternalRoute}
          >
            <Ionicons name="open-outline" size={18} color={colors.tertiary} />
            <Text style={styles.mapsBtnText}>Open turn-by-turn in Google Maps</Text>
          </Pressable>
        ) : (
          <Text style={styles.locationHint}>
            Enable location to see the route from where you are.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.elevated,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: 140 },
  body: { padding: 16 },
  name: { fontSize: 20, fontWeight: "900", color: colors.text },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  ratingText: { fontWeight: "800", color: colors.accentDark, fontSize: 13 },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  routeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.tertiary,
    paddingVertical: 14,
    borderRadius: radii.md,
    marginTop: 8,
  },
  routeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  mapsBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.tertiary,
  },
  locationHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: { opacity: 0.88 },
});
