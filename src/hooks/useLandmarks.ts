import { useCallback, useEffect, useState } from "react";
import { fetchLandmarks } from "../services/landmarkService";
import type { Landmark } from "../types/landmark";

export function useLandmarks() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLandmarks();
      setLandmarks(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not load landmarks";
      setError(message);
      setLandmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { landmarks, loading, error, refresh };
}
