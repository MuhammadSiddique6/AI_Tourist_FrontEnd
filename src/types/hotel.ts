import type { ImageSource } from "expo-image";
import type { LatLng } from "../utils/geo";

export interface NearbyHotel {
  id: string;
  name: string;
  coordinate: LatLng;
  distanceMeters: number;
  type?: string;
  address?: string;
  /** Mock — replace with API data later */
  pricePerNight?: number;
  currency?: string;
  imageSource?: ImageSource;
  rating?: number;
}
