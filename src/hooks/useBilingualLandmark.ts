import { useCallback, useState } from "react";
import type {
  BilingualOptions,
  ContentLanguage,
} from "../services/translationService";
import {
  getBilingualContent,
  getTextForSpeech,
  type BilingualContent,
} from "../services/translationService";
import { speakLandmarkSummary, stopSpeaking } from "../services/ttsService";

type Options = BilingualOptions;

export function useBilingualLandmark() {
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [bilingual, setBilingual] = useState<BilingualContent | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const openTranslation = useCallback(
    async (englishText: string, options?: Options) => {
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
  }, []);

  const listen = useCallback(
    async (englishText: string, lang: ContentLanguage, options?: Options) => {
      if (speaking) return;
      setSpeaking(true);
      stopSpeaking();
      try {
        const text = await getTextForSpeech(englishText, lang, options);
        speakLandmarkSummary(text, lang);
      } finally {
        setSpeaking(false);
      }
    },
    [speaking],
  );

  return {
    translationVisible,
    translating,
    bilingual,
    openTranslation,
    closeTranslation,
    listen,
    speaking,
  };
}
