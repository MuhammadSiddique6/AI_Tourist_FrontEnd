import type { LandmarkCategory } from "../types/landmark";

export type MapFilterId = "all" | LandmarkCategory | "hotels";

export const MAP_FILTER_LABELS: { id: MapFilterId; label: string }[] = [
  { id: "all", label: "Landmarks" },
  { id: "museum", label: "Museums" },
  { id: "religious", label: "Religious" },
  { id: "family", label: "Family" },
  { id: "hotels", label: "Nearby hotels" },
];
