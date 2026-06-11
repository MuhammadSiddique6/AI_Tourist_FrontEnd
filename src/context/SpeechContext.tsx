import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTextForSpeech,
  type BilingualOptions,
  type ContentLanguage,
} from "../services/translationService";
import { speakLandmarkSummary, stopSpeaking } from "../services/ttsService";

type SpeechContextValue = {
  isSpeaking: boolean;
  activeLanguage: ContentLanguage | null;
  listen: (
    englishText: string,
    lang: ContentLanguage,
    options?: BilingualOptions,
  ) => Promise<void>;
  stop: () => void;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<ContentLanguage | null>(
    null,
  );

  const clearSpeaking = useCallback(() => {
    setIsSpeaking(false);
    setActiveLanguage(null);
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    clearSpeaking();
  }, [clearSpeaking]);

  const listen = useCallback(
    async (
      englishText: string,
      lang: ContentLanguage,
      options?: BilingualOptions,
    ) => {
      stopSpeaking();
      clearSpeaking();

      try {
        const text = await getTextForSpeech(englishText, lang, options);
        if (!text.trim()) return;

        setIsSpeaking(true);
        setActiveLanguage(lang);

        speakLandmarkSummary(text, lang, {
          onStart: () => {
            setIsSpeaking(true);
            setActiveLanguage(lang);
          },
          onDone: clearSpeaking,
          onStopped: clearSpeaking,
        });
      } catch {
        clearSpeaking();
      }
    },
    [clearSpeaking],
  );

  const value = useMemo(
    () => ({ isSpeaking, activeLanguage, listen, stop }),
    [isSpeaking, activeLanguage, listen, stop],
  );

  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
}

export function useSpeech(): SpeechContextValue {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    throw new Error("useSpeech must be used within SpeechProvider");
  }
  return ctx;
}
