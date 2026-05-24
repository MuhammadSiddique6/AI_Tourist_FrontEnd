import type { LatLng } from "../utils/geo";

export interface NearbyHotel {
  id: string;
  name: string;
  coordinate: LatLng;
  distanceMeters: number;
  type?: string;
  address?: string;
}
