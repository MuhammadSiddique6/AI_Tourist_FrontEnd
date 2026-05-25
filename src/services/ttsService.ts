import * as Speech from "expo-speech";
import type { ContentLanguage } from "./translationService";

const SPEECH_LOCALES: Record<ContentLanguage, string> = {
  en: "en-US",
  ur: "ur-PK",
};

export function speakLandmarkSummary(
  text: string,
  language: ContentLanguage = "en",
): void {
  if (!text.trim()) return;
  Speech.stop();
  Speech.speak(text, {
    language: SPEECH_LOCALES[language],
    pitch: 1,
    rate: language === "ur" ? 0.88 : 0.95,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
