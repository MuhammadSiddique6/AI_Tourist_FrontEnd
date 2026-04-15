import type { Landmark, LandmarkCategory, LandmarkRecognitionResult } from "../types/landmark";

const BASE_LANDMARKS: Omit<Landmark, "confidence">[] = [
  {
    id: "badshahi",
    name: "Badshahi Mosque",
    summary:
      "Built in 1673 during Aurangzeb’s reign, the Badshahi Mosque is a masterpiece of Mughal architecture. Its vast courtyard, marble domes, and red sandstone walls make it one of South Asia’s most iconic landmarks.",
    etiquette:
      "Dress modestly; remove shoes before entering prayer halls. Avoid loud conversation during prayer times. Photography is usually allowed in courtyards—ask staff before using flash indoors.",
    history:
      "Commissioned by the sixth Mughal emperor Aurangzeb, the mosque remained the world’s largest for centuries. It has served as a military garrison and was restored as an active place of worship and heritage site.",
    coordinate: { latitude: 31.588, longitude: 74.3105 },
    category: "religious",
    distanceMeters: 420,
    imageUri:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&q=80",
  },
  {
    id: "lahore-museum",
    name: "Lahore Museum",
    summary:
      "Founded in 1865, the Lahore Museum houses Gandhara sculptures, miniature paintings, Islamic manuscripts, and the famous Fasting Buddha—offering a layered story of the region’s art and cultures.",
    etiquette:
      "Do not touch exhibits. Food and drink are not allowed in galleries. Speak softly and follow staff directions for photography, which may be restricted in certain rooms.",
    history:
      "The Indo-Saracenic building reflects colonial-era design fused with local motifs. Its collections grew through archaeological digs and royal donations, becoming Pakistan’s flagship museum.",
    coordinate: { latitude: 31.5686, longitude: 74.3088 },
    category: "museum",
    distanceMeters: 2100,
    imageUri:
      "https://images.unsplash.com/photo-1566127444979-b3d2b5252d75?w=1200&q=80",
  },
  {
    id: "minar",
    name: "Minar-e-Pakistan",
    summary:
      "This 70-meter tower in Iqbal Park marks the site of the 1940 Lahore Resolution. Its blend of Mughal, Islamic, and modern styles symbolizes the country’s independence movement.",
    etiquette:
      "Respect memorial spaces; avoid climbing restricted areas. Families often picnic nearby—keep shared spaces tidy and supervise children on stairs and viewpoints.",
    history:
      "Designed by Nasreddin Murat-Khan and completed in 1968, the minaret’s base depicts the ideological milestones that led to Pakistan’s creation.",
    coordinate: { latitude: 31.5925, longitude: 74.3095 },
    category: "nearby",
    distanceMeters: 950,
    imageUri:
      "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=1200&q=80",
  },
  {
    id: "shalimar",
    name: "Shalimar Gardens",
    summary:
      "A UNESCO World Heritage Site laid out in 1641, these Persian-style gardens feature terraced levels, marble pools, and elegant pavilions built for Mughal court leisure.",
    etiquette:
      "Stay on paths; do not pick flowers or climb historic structures. Swim only where explicitly allowed. Evening visits are popular—carry water and sun protection.",
    history:
      "Commissioned by Emperor Shah Jahan, the gardens exemplify charbagh geometry and hydraulic engineering that once fed hundreds of fountains.",
    coordinate: { latitude: 31.5889, longitude: 74.3822 },
    category: "family",
    distanceMeters: 7800,
    imageUri:
      "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=1200&q=80",
  },
  {
    id: "wazir-khan",
    name: "Wazir Khan Mosque",
    summary:
      "Known for faience tile work and frescoes, this 17th-century mosque in the Walled City is a jewel of Lahore’s urban heritage and a vibrant community mosque.",
    etiquette:
      "Cover shoulders and knees; women may wish to carry a scarf. Remove shoes at entrances. Be mindful of worshippers—visit outside peak prayer when possible.",
    history:
      "Completed in 1635 under Subahdar Wazir Khan, the mosque also historically housed shops whose rents supported its upkeep—a unique urban integration.",
    coordinate: { latitude: 31.5831, longitude: 74.3234 },
    category: "religious",
    distanceMeters: 1800,
    imageUri:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&q=80",
  },
];

const TRANSLATIONS: Record<string, string> = {
  badshahi:
    "[اردو] بادشاہی مسجد 1673 میں مغل فن تعمیر کی شاہکار ہے۔ بڑے صحن اور سنگ مرمر کے گنبد دیکھنے لائق ہیں۔",
  "lahore-museum":
    "[اردو] لاہور میوزیم میں گندھارا مجسمے اور نادرہ خطاطی کے نمونے محفوظ ہیں۔",
  minar:
    "[اردو] مینارِ پاکستان آزادی کی تحریک کی یادگار ہے۔",
  shalimar:
    "[اردو] شالیمار باغ فارسی طرز کے درجہ بند تالابوں کے ساتھ خوبصورت ہیں۔",
  "wazir-khan":
    "[اردو] وزیر خان مسجد کاشی کاری اور نقاشی کے لیے مشہور ہے۔",
};

function randomConfidence(): number {
  return Math.floor(85 + Math.random() * 14);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAllLandmarks(): Landmark[] {
  return BASE_LANDMARKS.map((l) => ({ ...l, confidence: 90 }));
}

export function getLandmarkById(id: string): Landmark | undefined {
  const base = BASE_LANDMARKS.find((l) => l.id === id);
  if (!base) return undefined;
  return { ...base, confidence: 90 };
}

export async function recognizeLandmarkMock(): Promise<LandmarkRecognitionResult> {
  await delay(900 + Math.floor(Math.random() * 900));
  const base = BASE_LANDMARKS[Math.floor(Math.random() * BASE_LANDMARKS.length)];
  const translatedPreview =
    TRANSLATIONS[base.id] ?? "[اردو] یہ ایک خوبصورت تاریخی مقام ہے۔";
  return {
    ...base,
    confidence: randomConfidence(),
    translatedPreview,
  };
}

export function filterLandmarksByCategory(
  landmarks: Landmark[],
  filter: "all" | LandmarkCategory
): Landmark[] {
  if (filter === "all") return landmarks;
  return landmarks.filter((l) => l.category === filter);
}

export type MapFilterId = "all" | LandmarkCategory;

export const MAP_FILTER_LABELS: { id: MapFilterId; label: string }[] = [
  { id: "all", label: "Nearby" },
  { id: "museum", label: "Museums" },
  { id: "religious", label: "Religious" },
  { id: "family", label: "Family" },
];
