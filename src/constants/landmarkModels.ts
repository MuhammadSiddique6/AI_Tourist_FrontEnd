import { normalizeLandmarkKey } from "./landmarkImages";

/** Bundled .glb models in assets/images (add more as you add files) */
export const LANDMARK_MODEL_ASSETS: Record<string, number> = {
  badshahi_mosque: require("../../assets/images/badshahi_mosque.glb"),
  eiffel_tower: require("../../assets/images/eiffel_tower.glb"),
  minar_e_pakistan: require("../../assets/images/minar_e_pakistan.glb"),
};

export function getLandmarkModelModule(slugOrName: string): number | null {
  const key = normalizeLandmarkKey(slugOrName);
  if (LANDMARK_MODEL_ASSETS[key] != null) return LANDMARK_MODEL_ASSETS[key];

  const partial = Object.keys(LANDMARK_MODEL_ASSETS).find(
    (assetKey) => key.includes(assetKey) || assetKey.includes(key),
  );
  return partial ? LANDMARK_MODEL_ASSETS[partial] : null;
}

export function hasLandmarkModel(slugOrName: string): boolean {
  return getLandmarkModelModule(slugOrName) != null;
}
