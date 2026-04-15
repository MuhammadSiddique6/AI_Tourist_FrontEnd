import * as Speech from "expo-speech";

export function speakLandmarkSummary(text: string): void {
  Speech.stop();
  Speech.speak(text, {
    language: "en-US",
    pitch: 1,
    rate: 0.95,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
