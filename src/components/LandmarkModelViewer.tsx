import { OrbitControls } from "@react-three/drei/native";
import { Canvas } from "@react-three/fiber/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type * as THREE from "three";
import { colors } from "../constants/theme";
import { loadGlbFromModule } from "../utils/loadGlbFromModule";
import { ModelErrorBoundary } from "./ModelErrorBoundary";

type SceneProps = {
  scene: THREE.Group;
};

function LoadedModel({ scene }: SceneProps) {
  return <primitive object={scene} />;
}

type Props = {
  modelModule: number;
  onError?: (message: string) => void;
};

export function LandmarkModelViewer({ modelModule, onError }: Props) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setScene(null);

    loadGlbFromModule(modelModule)
      .then((loaded) => {
        if (!cancelled) setScene(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load 3D model";
          onErrorRef.current?.(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modelModule]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!scene) {
    return null;
  }

  return (
    <View style={styles.container} collapsable={false}>
      <ModelErrorBoundary onError={onError}>
        <Canvas
          style={styles.canvas}
          camera={{ position: [0, 1.2, 4.5], fov: 50, near: 0.01, far: 1000 }}
          gl={{ antialias: true }}
          onCreated={(state) => {
            state.gl.setClearColor("#1a1f1c");
            // expo-gl does not support all pixelStorei flags — ignore unsupported ones
            const gl = state.gl.getContext() as WebGLRenderingContext & {
              pixelStorei: (...args: unknown[]) => void;
            };
            const nativePixelStorei = gl.pixelStorei.bind(gl);
            gl.pixelStorei = (...args: unknown[]) => {
              const param = args[0] as number;
              if (param === gl.UNPACK_FLIP_Y_WEBGL) {
                try {
                  nativePixelStorei(...args);
                } catch {
                  /* EXGL: unsupported on some devices */
                }
              }
            };
          }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 8, 5]} intensity={1.6} />
          <directionalLight position={[-4, 3, -3]} intensity={0.45} />
          <LoadedModel scene={scene} />
          <OrbitControls enablePan enableZoom enableRotate makeDefault />
        </Canvas>
      </ModelErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1f1c",
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1f1c",
  },
});
