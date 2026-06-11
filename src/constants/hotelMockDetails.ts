import type { ImageSource } from "expo-image";
import type { NearbyHotel } from "../types/hotel";

const MOCK_HOTEL_IMAGES: ImageSource[] = [
  require("../../assets/images/hotel_mock_1.jpg"),
  require("../../assets/images/hotel_mock_2.jpg"),
  require("../../assets/images/hotel_mock_3.jpg"),
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function mockPricePkr(id: string): number {
  const tiers = [4500, 5500, 6500, 7500, 8500, 9500, 12000, 15000, 18000, 22000];
  return tiers[hashId(id) % tiers.length];
}

function mockRating(id: string): number {
  const ratings = [3.8, 4.0, 4.2, 4.4, 4.6, 4.8];
  return ratings[hashId(id + "r") % ratings.length];
}

function mockImage(id: string): ImageSource {
  return MOCK_HOTEL_IMAGES[hashId(id + "img") % MOCK_HOTEL_IMAGES.length];
}

/** Attach demo price, photo, and rating — replace images in assets/images/hotel_mock_*.jpg */
export function enrichHotelWithMockDetails(hotel: NearbyHotel): NearbyHotel {
  return {
    ...hotel,
    pricePerNight: mockPricePkr(hotel.id),
    currency: "PKR",
    imageSource: mockImage(hotel.id),
    rating: mockRating(hotel.id),
  };
}

export function enrichHotelsWithMockDetails(hotels: NearbyHotel[]): NearbyHotel[] {
  return hotels.map(enrichHotelWithMockDetails);
}

export function formatHotelPrice(hotel: NearbyHotel): string {
  const amount = hotel.pricePerNight ?? 0;
  const currency = hotel.currency ?? "PKR";
  return `${currency} ${amount.toLocaleString("en-PK")} / night`;
}
