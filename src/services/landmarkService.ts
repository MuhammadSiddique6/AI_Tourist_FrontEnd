import type { ImageSource } from "expo-image";
import { resolveLandmarkImageSource } from "../constants/landmarkImages";
import type {
  Landmark,
  LandmarkCategory,
  LandmarkRecognitionResult,
} from "../types/landmark";
import api from "./api";

export type { MapFilterId } from "../constants/mapFilters";
export { MAP_FILTER_LABELS } from "../constants/mapFilters";

export interface ApiLandmark {
  id: number | string;
  name: string;
  description?: string;
  summary?: string;
  etiquette?: string;
  history?: string;
  latitude?: number | string;
  longitude?: number | string;
  category?: string;
  image_path?: string | null;
  distance_meters?: number;
  slug?: string;
}

function parseLandmarkList(data: unknown): ApiLandmark[] {
  if (Array.isArray(data)) return data as ApiLandmark[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.landmarks)) return obj.landmarks as ApiLandmark[];
    if (Array.isArray(obj.data)) return obj.data as ApiLandmark[];
  }
  return [];
}

/** Backend uses slugs like `badshahi_mosque` — show a readable title */
export function formatLandmarkDisplayName(slugOrName: string): string {
  const key = slugOrName.toLowerCase().replace(/\.(jpe?g|png|webp)$/i, "");
  if (!key.includes("_") && key.includes(" ")) {
    return slugOrName;
  }
  return key
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferCategoryFromSlug(slug: string): LandmarkCategory {
  const key = slug.toLowerCase();
  if (key.includes("museum")) return "museum";
  if (
    key.includes("mosque") ||
    key.includes("darbar") ||
    key.includes("shrine") ||
    key.includes("masjid")
  ) {
    return "religious";
  }
  if (
    key.includes("garden") ||
    key.includes("park") ||
    key.includes("zoo")
  ) {
    return "family";
  }
  return "nearby";
}

function toCategory(value: string | undefined, slug: string): LandmarkCategory {
  if (value) {
    const normalized = value.toLowerCase();
    if (normalized === "museum" || normalized === "museums") return "museum";
    if (
      normalized === "religious" ||
      normalized === "religion" ||
      normalized === "mosque" ||
      normalized === "shrine"
    ) {
      return "religious";
    }
    if (normalized === "family" || normalized === "park" || normalized === "garden") {
      return "family";
    }
    if (normalized === "nearby") return "nearby";
  }
  return inferCategoryFromSlug(slug);
}

function toConfidence(value?: number): number {
  if (value == null || Number.isNaN(value)) return 90;
  if (value <= 1) return Math.round(value * 100);
  return Math.round(value);
}

export function mapApiLandmarkToLandmark(
  raw: ApiLandmark,
  options?: { confidence?: number; translatedPreview?: string },
): Landmark {
  const slug = raw.slug ?? raw.name;
  const imageSource = resolveLandmarkImageSource(slug, raw.image_path);
  const lat = Number(raw.latitude) || 0;
  const lng = Number(raw.longitude) || 0;
  const displayName = formatLandmarkDisplayName(slug);

  return {
    id: String(raw.id),
    slug,
    name: displayName,
    confidence: toConfidence(options?.confidence),
    summary: raw.summary ?? raw.description ?? "",
    etiquette: raw.etiquette ?? "",
    history: raw.history ?? "",
    coordinate: { latitude: lat, longitude: lng },
    category: toCategory(raw.category, slug),
    distanceMeters: raw.distance_meters ?? 0,
    imageSource,
    translatedPreview: options?.translatedPreview,
  };
}

export function mapApiLandmarkToRecognition(
  raw: ApiLandmark,
  confidence?: number,
  translatedPreview?: string,
): LandmarkRecognitionResult {
  const landmark = mapApiLandmarkToLandmark(raw, {
    confidence,
    translatedPreview,
  });
  return {
    ...landmark,
    translatedPreview: translatedPreview ?? landmark.translatedPreview ?? "",
  };
}

export async function fetchLandmarks(): Promise<Landmark[]> {
  const data = await api.landmarks.getAll();
  return parseLandmarkList(data).map((item) => mapApiLandmarkToLandmark(item));
}

export async function fetchLandmarkById(id: string): Promise<Landmark | null> {
  const data = await api.landmarks.getById(id);
  const raw =
    data && typeof data === "object" && "landmark" in (data as object)
      ? (data as { landmark: ApiLandmark }).landmark
      : (data as ApiLandmark);
  if (!raw?.id && !raw?.name) return null;
  return mapApiLandmarkToLandmark(raw);
}

export function filterLandmarksByCategory(
  landmarks: Landmark[],
  filter: "all" | LandmarkCategory | "hotels",
): Landmark[] {
  if (filter === "hotels") return [];
  if (filter === "all") return landmarks;
  return landmarks.filter((l) => l.category === filter);
}

export function getLandmarkImageSource(landmark: {
  name: string;
  imageSource?: ImageSource;
}): ImageSource {
  return landmark.imageSource ?? resolveLandmarkImageSource(landmark.name);
}
