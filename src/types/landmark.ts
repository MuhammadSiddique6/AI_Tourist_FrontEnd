import type { ImageSource } from "expo-image";

export type LandmarkCategory = "nearby" | "museum" | "religious" | "family";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Landmark {
  id: string;
  /** Backend slug, e.g. badshahi_mosque */
  slug: string;
  name: string;
  confidence: number;
  summary: string;
  etiquette: string;
  history: string;
  coordinate: Coordinates;
  category: LandmarkCategory;
  distanceMeters: number;
  /** Local asset or remote URI */
  imageSource: ImageSource;
  translatedPreview?: string;
}

export interface LandmarkRecognitionResult extends Landmark {
  translatedPreview: string;
}
