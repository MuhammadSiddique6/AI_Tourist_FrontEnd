import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Landmark } from "../types/landmark";

type SavedLandmarksContextValue = {
  saved: Landmark[];
  saveLandmark: (landmark: Landmark) => void;
  removeLandmark: (id: string) => void;
  isSaved: (id: string) => boolean;
};

const SavedLandmarksContext = createContext<SavedLandmarksContextValue | undefined>(undefined);

export function SavedLandmarksProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Landmark[]>([]);

  const saveLandmark = useCallback((landmark: Landmark) => {
    setSaved((prev) => {
      if (prev.some((l) => l.id === landmark.id)) return prev;
      return [...prev, { ...landmark }];
    });
  }, []);

  const removeLandmark = useCallback((id: string) => {
    setSaved((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((l) => l.id === id),
    [saved]
  );

  const value = useMemo(
    () => ({
      saved,
      saveLandmark,
      removeLandmark,
      isSaved,
    }),
    [saved, saveLandmark, removeLandmark, isSaved]
  );

  return <SavedLandmarksContext.Provider value={value}>{children}</SavedLandmarksContext.Provider>;
}

export function useSavedLandmarks(): SavedLandmarksContextValue {
  const ctx = useContext(SavedLandmarksContext);
  if (!ctx) throw new Error("useSavedLandmarks must be used within SavedLandmarksProvider");
  return ctx;
}
