import type { Landmark } from "../types/landmark";

export function mockTranslateLandmark(landmark: Landmark): string {
  const urdu =
    landmark.translatedPreview?.trim() ||
    `[اردو] ${landmark.name} — یہاں کی ثقافتی کہانی سیکھنے کے لیے ہمارے ساتھ رہیں۔`;
  return `${urdu}\n\n[English preview]\n${landmark.summary.slice(0, 200)}…`;
}
