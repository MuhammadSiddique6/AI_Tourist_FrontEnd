import type { Ionicons } from "@expo/vector-icons";
import type { LandmarkCategory } from "../types/landmark";

export type MapFilterId = "all" | LandmarkCategory | "hotels";

type IonName = keyof typeof Ionicons.glyphMap;

export const HOTEL_MAP_COLOR = "#DC2626";
export const HOTEL_MAP_COLOR_DARK = "#B91C1C";

export const MAP_FILTER_LABELS: {
  id: MapFilterId;
  label: string;
  icon: IonName;
}[] = [
  { id: "all", label: "Landmarks", icon: "location" },
  { id: "museum", label: "Museums", icon: "business" },
  { id: "religious", label: "Religious", icon: "moon" },
  { id: "hotels", label: "Hotels", icon: "business" },
];
