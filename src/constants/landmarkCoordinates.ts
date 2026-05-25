import { normalizeLandmarkKey } from "./landmarkImages";

/** Correct map pins when API stores wrong/global coordinates. */
export const LAHORE_LANDMARK_COORDINATES: Record<
  string,
  { latitude: number; longitude: number }
> = {
  /** Bahria Town replica — API incorrectly had Paris coords */
  eiffel_tower: { latitude: 31.3557861, longitude: 74.1847972 },
};

/** Rough Lahore metro bounds for detecting misplaced pins */
const LAHORE_BOUNDS = {
  minLat: 31.2,
  maxLat: 31.75,
  minLng: 73.95,
  maxLng: 74.45,
};

function isInsideLahore(lat: number, lng: number): boolean {
  return (
    lat >= LAHORE_BOUNDS.minLat &&
    lat <= LAHORE_BOUNDS.maxLat &&
    lng >= LAHORE_BOUNDS.minLng &&
    lng <= LAHORE_BOUNDS.maxLng
  );
}

export function resolveLandmarkCoordinates(
  slugOrName: string,
  latitude: number,
  longitude: number,
): { latitude: number; longitude: number } {
  const key = normalizeLandmarkKey(slugOrName);
  const override = LAHORE_LANDMARK_COORDINATES[key];
  if (override) return override;

  if (latitude && longitude && isInsideLahore(latitude, longitude)) {
    return { latitude, longitude };
  }

  return { latitude, longitude };
}
