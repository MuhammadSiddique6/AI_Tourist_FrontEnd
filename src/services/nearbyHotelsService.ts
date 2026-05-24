import type { NearbyHotel } from "../types/hotel";
import { distanceMeters, type LatLng } from "../utils/geo";

/** Search radius around the user's GPS position */
const RADIUS_METERS = 8000;
const MAX_HOTELS = 25;

const PHOTON_BASE = "https://photon.komoot.io/api/";

type PhotonFeature = {
  type: "Feature";
  properties: {
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    street?: string;
    locality?: string;
    city?: string;
    district?: string;
    country?: string;
    postcode?: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function buildAddress(props: PhotonFeature["properties"]): string | undefined {
  const parts = [
    props.street,
    props.locality,
    props.district,
    props.city,
    props.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function isHotelFeature(props: PhotonFeature["properties"]): boolean {
  if (props.osm_key === "tourism" && props.osm_value) {
    return /hotel|hostel|guest_house|motel|chalet|apartment/i.test(
      props.osm_value,
    );
  }
  if (props.osm_key === "amenity" && props.osm_value === "hotel") return true;
  return false;
}

async function searchPhoton(
  center: LatLng,
  query: string,
  limit: number,
): Promise<PhotonFeature[]> {
  const params = new URLSearchParams({
    q: query,
    lat: String(center.latitude),
    lon: String(center.longitude),
    limit: String(limit),
    lang: "en",
  });

  const response = await fetch(`${PHOTON_BASE}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      // Photon / OSM policy: identify the app
      "User-Agent": "AI-Tourist-Companion/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Hotel search is temporarily unavailable.");
  }

  const data = (await response.json()) as PhotonResponse;
  return data.features ?? [];
}

function featureToHotel(
  feature: PhotonFeature,
  center: LatLng,
): NearbyHotel | null {
  const props = feature.properties;
  const name = props.name?.trim();
  if (!name) return null;

  const [lon, lat] = feature.geometry.coordinates;
  const coordinate = { latitude: lat, longitude: lon };
  const dist = distanceMeters(center, coordinate);

  if (dist > RADIUS_METERS) return null;

  return {
    id: `osm-${props.osm_id ?? `${lat}-${lon}`}`,
    name,
    coordinate,
    distanceMeters: dist,
    type: props.osm_value?.replace(/_/g, " "),
    address: buildAddress(props),
  };
}

/**
 * Real hotels from OpenStreetMap via Photon (Komoot).
 * Returns named places with verified coordinates near the user.
 */
export async function fetchNearbyHotels(
  center: LatLng,
  radiusMeters = RADIUS_METERS,
): Promise<NearbyHotel[]> {
  const effectiveRadius = radiusMeters;

  const [hotelFeatures, hostelFeatures] = await Promise.all([
    searchPhoton(center, "hotel", 30),
    searchPhoton(center, "hostel", 15),
  ]);

  const merged = [...hotelFeatures, ...hostelFeatures];
  const seen = new Set<string>();
  const hotels: NearbyHotel[] = [];

  for (const feature of merged) {
    const props = feature.properties;
    const hasName = Boolean(props.name?.trim());
    if (!hasName) continue;
    if (!isHotelFeature(props) && !/hotel|inn|lodge|resort/i.test(props.name ?? "")) {
      continue;
    }

    const hotel = featureToHotel(feature, center);
    if (!hotel) continue;
    if (hotel.distanceMeters > effectiveRadius) continue;
    if (seen.has(hotel.id)) continue;

    seen.add(hotel.id);
    hotels.push(hotel);
  }

  if (hotels.length === 0) {
    throw new Error(
      "No named hotels found near you. Try the locate button or move to a city area.",
    );
  }

  return hotels
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_HOTELS);
}
