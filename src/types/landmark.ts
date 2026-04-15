export type LandmarkCategory = "nearby" | "museum" | "religious" | "family";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Landmark {
  id: string;
  name: string;
  confidence: number;
  summary: string;
  etiquette: string;
  history: string;
  coordinate: Coordinates;
  category: LandmarkCategory;
  /** meters — mock display value */
  distanceMeters: number;
  /** Remote image for header */
  imageUri: string;
  /** Present when produced by mock recognition */
  translatedPreview?: string;
}

export interface LandmarkRecognitionResult extends Landmark {
  translatedPreview: string;
}
