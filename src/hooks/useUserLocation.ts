import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "../utils/geo";

type Status = "idle" | "loading" | "granted" | "denied" | "error";

export function useUserLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const { status: perm } =
        await Location.requestForegroundPermissionsAsync();

      if (perm !== Location.PermissionStatus.GRANTED) {
        setStatus("denied");
        setError("Location permission is required to show where you are.");
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LatLng = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(coords);
      setStatus("granted");
      return coords;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not get your location";
      setError(message);
      setStatus("error");
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, status, error, refresh };
}
