import { useCallback, useState } from "react";
import { useSpeech } from "../context/SpeechContext";
import type { BilingualOptions } from "../services/translationService";
import {
  getBilingualContent,
  type BilingualContent,
} from "../services/translationService";

export function useBilingualLandmark() {
  const { listen, stop, isSpeaking } = useSpeech();
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [bilingual, setBilingual] = useState<BilingualContent | null>(null);

  const openTranslation = useCallback(
    async (englishText: string, options?: BilingualOptions) => {
      setTranslationVisible(true);
      setTranslating(true);
      setBilingual(null);
      try {
        const content = await getBilingualContent(englishText, options);
        setBilingual(content);
      } finally {
        setTranslating(false);
      }
    },
    [],
  );

  const closeTranslation = useCallback(() => {
    setTranslationVisible(false);
    stop();
  }, [stop]);

  return {
    translationVisible,
    translating,
    bilingual,
    openTranslation,
    closeTranslation,
    listen,
    stopSpeaking: stop,
    speaking: isSpeaking,
  };
}
