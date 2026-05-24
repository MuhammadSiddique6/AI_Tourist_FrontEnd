import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system/legacy";
import { Platform } from "react-native";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three-stdlib";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof globalThis.atob !== "function") {
    throw new Error("Cannot decode model file on this device");
  }
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getModuleUri(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  let uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error("Could not resolve 3D model file");
  }

  if (
    Platform.OS === "android" &&
    !uri.startsWith("file://") &&
    !uri.startsWith("http")
  ) {
    uri = `file://${uri}`;
  }

  return uri;
}

async function readModelArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return response.arrayBuffer();
    }
  } catch {
    // fall through to FileSystem
  }

  const base64 = await readAsStringAsync(uri, { encoding: "base64" });
  return base64ToArrayBuffer(base64);
}

/** Replace texture-based materials — RN cannot load embedded GLB textures via Blob */
function applySafeMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const source = child.material;
    const list = Array.isArray(source) ? source : [source];

    const replaced = list.map((mat) => {
      const color =
        mat && "color" in mat && mat.color instanceof THREE.Color
          ? mat.color.clone()
          : new THREE.Color(0xb8c4bc);

      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.65,
        metalness: 0.15,
      });
    });

    child.material = replaced.length === 1 ? replaced[0] : replaced;
  });
}

export function fitModelToView(scene: THREE.Object3D, targetSize = 2.5) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / maxDim;
  scene.scale.setScalar(scale);

  const center = new THREE.Vector3();
  box.getCenter(center);
  scene.position.x -= center.x * scale;
  scene.position.y -= center.y * scale;
  scene.position.z -= center.z * scale;
}

/**
 * Load a Metro-bundled .glb using GLTFLoader.parse (works on React Native).
 * Avoids useLoader(URL) which often fails with "not supported" on mobile.
 */
export async function loadGlbFromModule(moduleId: number): Promise<THREE.Group> {
  const uri = await getModuleUri(moduleId);
  const arrayBuffer = await readModelArrayBuffer(uri);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(
      arrayBuffer,
      "",
      (gltf: GLTF) => {
        const scene = gltf.scene;
        applySafeMaterials(scene);
        fitModelToView(scene);
        resolve(scene);
      },
      (err) => {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to parse GLB model";
        reject(new Error(message));
      },
    );
  });
}
