import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HotelDetailPanel } from "../components/HotelDetailPanel";
import { MapCategoryChips } from "../components/MapCategoryChips";
import { HOTEL_MAP_COLOR } from "../constants/mapFilters";
import { colors, radii, shadows } from "../constants/theme";
import { useLandmarks } from "../hooks/useLandmarks";
import { useUserLocation } from "../hooks/useUserLocation";
import {
  filterLandmarksByCategory,
  type MapFilterId,
} from "../services/landmarkService";
import { fetchNearbyHotels } from "../services/nearbyHotelsService";
import type { NearbyHotel } from "../types/hotel";
import type { Landmark } from "../types/landmark";
import type { AppStackParamList, MainTabParamList } from "../types/navigation";
import type { LatLng } from "../utils/geo";

type MapNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Map">,
  StackNavigationProp<AppStackParamList>
>;

/** Covers central Lahore + Bahria Town (Eiffel replica) */
const LAHORE: Region = {
  latitude: 31.48,
  longitude: 74.3,
  latitudeDelta: 0.32,
  longitudeDelta: 0.22,
};

const ZOOM_DELTA = 0.045;
const ROUTE_COLOR = HOTEL_MAP_COLOR;

export function MapScreen() {
  const navigation = useNavigation<MapNav>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [filter, setFilter] = useState<MapFilterId>("all");
  const { landmarks, loading, error, refresh } = useLandmarks();
  const {
    location: userLocation,
    status: locationStatus,
    error: locationError,
    refresh: refreshLocation,
  } = useUserLocation();

  const [hotels, setHotels] = useState<NearbyHotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<NearbyHotel | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  const visibleLandmarks = useMemo(
    () => filterLandmarksByCategory(landmarks, filter),
    [landmarks, filter],
  );

  const showLandmarks = filter !== "hotels";
  const showHotels = filter === "hotels";

  const loadHotels = useCallback(async () => {
    if (!userLocation) {
      setHotels([]);
      setHotelsError(
        locationError ?? "Turn on location to find hotels near you.",
      );
      return;
    }

    setHotelsLoading(true);
    setHotelsError(null);
    try {
      const list = await fetchNearbyHotels(userLocation);
      setHotels(list);
      if (list.length === 0) {
        setHotelsError("No hotels found within 8 km of your location.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not load hotels";
      setHotelsError(message);
      setHotels([]);
    } finally {
      setHotelsLoading(false);
    }
  }, [userLocation, locationError]);

  useEffect(() => {
    if (showHotels) {
      loadHotels();
    } else {
      setSelectedHotel(null);
      setShowRoute(false);
    }
  }, [showHotels, loadHotels]);

  const initialRegion = useMemo((): Region => {
    if (userLocation) {
      return { ...userLocation, latitudeDelta: ZOOM_DELTA, longitudeDelta: ZOOM_DELTA };
    }
    const first = landmarks[0];
    if (first?.coordinate.latitude && first.coordinate.longitude) {
      return {
        latitude: first.coordinate.latitude,
        longitude: first.coordinate.longitude,
        latitudeDelta: LAHORE.latitudeDelta,
        longitudeDelta: LAHORE.longitudeDelta,
      };
    }
    return LAHORE;
  }, [userLocation, landmarks]);

  const bottomPad = 56 + insets.bottom;
  const hasFittedLandmarks = useRef(false);

  const fitCoordinates = useCallback(
    (coords: LatLng[], animated = true) => {
      if (!mapRef.current || coords.length === 0) return;
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: {
          top: 100 + insets.top,
          right: 48,
          bottom: selectedHotel ? bottomPad + 280 : bottomPad + 90,
          left: 48,
        },
        animated,
      });
    },
    [insets.top, bottomPad, selectedHotel],
  );

  useEffect(() => {
    if (
      hasFittedLandmarks.current ||
      !mapRef.current ||
      !showLandmarks ||
      loading ||
      visibleLandmarks.length === 0
    ) {
      return;
    }

    const coords = visibleLandmarks
      .filter(
        (lm) =>
          lm.coordinate.latitude !== 0 && lm.coordinate.longitude !== 0,
      )
      .map((lm) => lm.coordinate);

    if (coords.length === 0) return;

    hasFittedLandmarks.current = true;
    fitCoordinates(coords);
  }, [visibleLandmarks, showLandmarks, loading, fitCoordinates]);

  const centerOnUser = useCallback(async () => {
    const coords = userLocation ?? (await refreshLocation());
    if (!coords || !mapRef.current) {
      Alert.alert(
        "Location unavailable",
        locationError ?? "Enable location permission in settings.",
      );
      return;
    }
    mapRef.current.animateToRegion(
      {
        ...coords,
        latitudeDelta: ZOOM_DELTA,
        longitudeDelta: ZOOM_DELTA,
      },
      500,
    );
  }, [userLocation, refreshLocation, locationError]);

  const openLandmark = (landmark: Landmark) => {
    navigation.navigate("Detail", { landmark });
  };

  const selectHotel = useCallback(
    (hotel: NearbyHotel) => {
      setSelectedHotel(hotel);
      setShowRoute(false);

      const coords: LatLng[] = [hotel.coordinate];
      if (userLocation) coords.unshift(userLocation);
      fitCoordinates(coords);
    },
    [userLocation, fitCoordinates],
  );

  const showHotelRoute = useCallback(() => {
    if (!selectedHotel) return;
    if (!userLocation) {
      Alert.alert(
        "Location needed",
        "Enable location to draw the route from where you are.",
      );
      return;
    }
    setShowRoute(true);
    fitCoordinates([userLocation, selectedHotel.coordinate]);
  }, [selectedHotel, userLocation, fitCoordinates]);

  const closeHotelDetail = useCallback(() => {
    setSelectedHotel(null);
    setShowRoute(false);
  }, []);

  const routeCoordinates = useMemo((): LatLng[] => {
    if (!showRoute || !selectedHotel || !userLocation) return [];
    return [userLocation, selectedHotel.coordinate];
  }, [showRoute, selectedHotel, userLocation]);

  const footerSubtext = useMemo(() => {
    if (showHotels) {
      if (hotelsLoading) return "Searching hotels near you…";
      if (hotelsError) return hotelsError;
      if (selectedHotel) return `Selected: ${selectedHotel.name}`;
      return `${hotels.length} hotel${hotels.length === 1 ? "" : "s"} near you · tap a pin`;
    }
    if (loading) return "Loading landmarks…";
    if (error) return "Could not load landmarks";
    return `${visibleLandmarks.length} site${visibleLandmarks.length === 1 ? "" : "s"} · tap a pin`;
  }, [
    showHotels,
    hotelsLoading,
    hotelsError,
    hotels.length,
    selectedHotel,
    loading,
    error,
    visibleLandmarks.length,
  ]);

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={locationStatus === "granted"}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {showLandmarks
          ? visibleLandmarks
              .filter(
                (lm) =>
                  lm.coordinate.latitude !== 0 && lm.coordinate.longitude !== 0,
              )
              .map((lm) => (
                <Marker
                  key={lm.id}
                  coordinate={lm.coordinate}
                  title={lm.name}
                  description={lm.category}
                  pinColor={colors.primary}
                  onCalloutPress={() => openLandmark(lm)}
                  onPress={() => openLandmark(lm)}
                />
              ))
          : null}

        {showHotels
          ? hotels.map((hotel) => (
              <Marker
                key={hotel.id}
                coordinate={hotel.coordinate}
                title={hotel.name}
                description={hotel.address ?? "Hotel"}
                pinColor="red"
                onPress={() => selectHotel(hotel)}
              />
            ))
          : null}

        {routeCoordinates.length >= 2 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={ROUTE_COLOR}
            strokeWidth={5}
            lineDashPattern={[1]}
          />
        ) : null}

      </MapView>

      <MapCategoryChips active={filter} onChange={setFilter} />

      <Pressable
        style={[styles.myLocationBtn, { top: 118 + insets.top }]}
        onPress={centerOnUser}
        accessibilityLabel="Center on my location"
      >
        {locationStatus === "loading" ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={24} color={colors.primary} />
        )}
      </Pressable>

      {selectedHotel && showHotels ? (
        <View style={[styles.hotelPanelWrap, { bottom: bottomPad + 8 }]}>
          <HotelDetailPanel
            hotel={selectedHotel}
            userLocation={userLocation}
            onClose={closeHotelDetail}
            onShowRoute={showHotelRoute}
          />
        </View>
      ) : (
        <View style={[styles.footer, { bottom: bottomPad }]}>
          <View style={styles.titlePill}>
            <View style={styles.titleRow}>
              {showHotels ? (
                <Ionicons name="business" size={22} color={HOTEL_MAP_COLOR} />
              ) : (
                <Ionicons name="map" size={22} color={colors.primary} />
              )}
              <Text style={styles.screenTitle}>
                {showHotels ? "Nearby hotels" : "Heritage map"}
              </Text>
            </View>
            {loading && showLandmarks && !error ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
            ) : hotelsLoading && showHotels ? (
              <ActivityIndicator color={HOTEL_MAP_COLOR} style={{ marginTop: 8 }} />
            ) : (
              <Text style={styles.screenSub}>{footerSubtext}</Text>
            )}
            {error && showLandmarks ? (
              <Pressable onPress={refresh} style={styles.retryWrap}>
                <Text style={styles.retry}>Retry landmarks</Text>
              </Pressable>
            ) : null}
            {hotelsError && showHotels && !hotelsLoading ? (
              <Pressable onPress={loadHotels} style={styles.retryWrap}>
                <Text style={styles.retry}>Retry hotels</Text>
              </Pressable>
            ) : null}
            {locationStatus === "denied" ? (
              <Pressable onPress={refreshLocation} style={styles.retryWrap}>
                <Text style={styles.retry}>Enable location</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  myLocationBtn: {
    position: "absolute",
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  footer: {
    position: "absolute",
    left: 14,
    right: 14,
  },
  hotelPanelWrap: {
    position: "absolute",
    left: 14,
    right: 14,
  },
  titlePill: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    ...shadows.elevated,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  screenSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  retryWrap: { marginTop: 8 },
  retry: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});
