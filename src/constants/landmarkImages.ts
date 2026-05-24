import type { ImageSource } from "expo-image";

/** Local landmark photos in assets/images — keyed by normalized slug */
export const LANDMARK_IMAGE_ASSETS: Record<string, ImageSource> = {
  badshahi_mosque: require("../../assets/images/badshahi_mosque.jpg"),
  data_darbar: require("../../assets/images/data_darbar.jpg"),
  dehli_gate: require("../../assets/images/dehli_gate.jpg"),
  delhi_gate: require("../../assets/images/dehli_gate.jpg"),
  eiffel_tower: require("../../assets/images/eiffel_tower.jpg"),
  gpo: require("../../assets/images/gpo.jpg"),
  lahore_museum: require("../../assets/images/lahore_museum.jpg"),
  lahore_railway_station: require("../../assets/images/lahore_railway_station.jpg"),
  minar_e_pakistan: require("../../assets/images/minar_e_pakistan.jpg"),
  shahi_qila: require("../../assets/images/shahi_qila.jpeg"),
  lahore_fort: require("../../assets/images/shahi_qila.jpeg"),
  wazir_khan_mosque: require("../../assets/images/wazir_khan_mosque.jpg"),
};

const DEFAULT_IMAGE = LANDMARK_IMAGE_ASSETS.badshahi_mosque;

export function normalizeLandmarkKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp)$/i, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function findAssetKey(key: string): string | undefined {
  if (LANDMARK_IMAGE_ASSETS[key]) return key;

  const partial = Object.keys(LANDMARK_IMAGE_ASSETS).find(
    (assetKey) => key.includes(assetKey) || assetKey.includes(key),
  );
  return partial;
}

/** Resolve a bundled image from landmark name and/or backend image path */
export function resolveLandmarkImageSource(
  name?: string,
  imagePath?: string | null,
): ImageSource {
  const candidates: string[] = [];

  if (imagePath) {
    const fileName = imagePath.split(/[/\\]/).pop() ?? imagePath;
    candidates.push(normalizeLandmarkKey(fileName));
  }
  if (name) {
    candidates.push(normalizeLandmarkKey(name));
  }

  for (const key of candidates) {
    const match = findAssetKey(key);
    if (match) return LANDMARK_IMAGE_ASSETS[match];
  }

  return DEFAULT_IMAGE;
}
