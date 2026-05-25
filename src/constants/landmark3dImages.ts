import type { ImageSource } from "expo-image";
import { normalizeLandmarkKey, resolveLandmarkImageSource } from "./landmarkImages";
import { hasLandmarkModel } from "./landmarkModels";

/**
 * Mock 3D preview images for landmarks without a .glb model.
 * Replace files in assets/images/3d/<slug>.jpg with your own 3D renders.
 */
export const LANDMARK_3D_IMAGE_ASSETS: Record<string, ImageSource> = {
  data_darbar: require("../../assets/images/3d/data_darbar.jpg"),
  dehli_gate: require("../../assets/images/3d/dehli_gate.jpg"),
  delhi_gate: require("../../assets/images/3d/dehli_gate.jpg"),
  gpo: require("../../assets/images/3d/gpo.jpg"),
  lahore_museum: require("../../assets/images/3d/lahore_museum.jpg"),
  lahore_railway_station: require("../../assets/images/3d/lahore_railway_station.jpg"),
  shahi_qila: require("../../assets/images/3d/shahi_qila.jpg"),
  lahore_fort: require("../../assets/images/3d/shahi_qila.jpg"),
  wazir_khan_mosque: require("../../assets/images/3d/wazir_khan_mosque.jpg"),
};

function find3dImageKey(key: string): string | undefined {
  if (LANDMARK_3D_IMAGE_ASSETS[key]) return key;
  return Object.keys(LANDMARK_3D_IMAGE_ASSETS).find(
    (assetKey) => key.includes(assetKey) || assetKey.includes(key),
  );
}

/** True when landmark has interactive .glb (not 3D image). */
export function hasLandmarkGlbModel(slugOrName: string): boolean {
  return hasLandmarkModel(slugOrName);
}

/** True when landmark should show "View 3D Image" (no .glb). */
export function hasLandmark3dImage(slugOrName: string): boolean {
  return !hasLandmarkGlbModel(slugOrName);
}

export function getLandmark3dImageSource(
  slugOrName: string,
  imagePath?: string | null,
): ImageSource {
  const key = normalizeLandmarkKey(slugOrName);
  const match = find3dImageKey(key);
  if (match) return LANDMARK_3D_IMAGE_ASSETS[match];
  return resolveLandmarkImageSource(slugOrName, imagePath);
}
