import {
  getGenericUrduSection,
  getLandmarkUrduSection,
  type UrduSection,
} from "../constants/landmarkUrduContent";
import api from "./api";

export type ContentLanguage = "en" | "ur";

export type BilingualContent = {
  english: string;
  urdu: string;
};

const cache = new Map<string, BilingualContent>();

/** Arabic / Urdu script ranges */
const URDU_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsUrduScript(text: string): boolean {
  return URDU_SCRIPT.test(text);
}

/** Reject strings that are mostly Latin (English) mislabeled as Urdu. */
export function isValidUrduText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!containsUrduScript(trimmed)) return false;

  const latinLetters = (trimmed.match(/[A-Za-z]/g) ?? []).length;
  const urduLetters = (trimmed.match(URDU_SCRIPT) ?? []).length;
  return urduLetters >= latinLetters;
}

function cacheKey(
  text: string,
  name?: string,
  slug?: string,
  section?: UrduSection,
): string {
  return `${slug ?? ""}:${section ?? "summary"}:${name ?? ""}::${text.slice(0, 200)}`;
}

function extractTranslated(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const row = res as Record<string, unknown>;

  const urduFields = [
    row.urdu,
    row.urdu_text,
    row.translated_urdu,
    row.translation_urdu,
  ];
  for (const field of urduFields) {
    if (typeof field === "string" && isValidUrduText(field)) return field.trim();
  }

  const direct =
    row.translated_text ??
    row.translation ??
    row.translated ??
    row.text ??
    row.result;
  if (typeof direct === "string" && isValidUrduText(direct)) return direct.trim();

  if (row.data && typeof row.data === "object") {
    const data = row.data as Record<string, unknown>;
    for (const field of [data.urdu, data.urdu_text, data.translated_text, data.translation]) {
      if (typeof field === "string" && isValidUrduText(field)) return field.trim();
    }
  }
  return null;
}

async function fetchTranslation(text: string): Promise<string | null> {
  if (!text.trim()) return null;

  const targets = ["ur", "ur-PK", "urdu"] as const;
  for (const target of targets) {
    try {
      const res = await api.translate.translateText(text, target);
      const translated = extractTranslated(res);
      if (translated) return translated;
    } catch {
      // try next target or fall through to bundled Urdu
    }
  }
  return null;
}

function resolveBundledUrdu(
  slug: string | undefined,
  section: UrduSection,
  landmarkName?: string,
): string {
  const fromSlug = getLandmarkUrduSection(slug, section);
  if (fromSlug) return fromSlug;

  const fromName = landmarkName
    ? getLandmarkUrduSection(landmarkName, section)
    : null;
  if (fromName) return fromName;

  return getGenericUrduSection(section);
}

export type BilingualOptions = {
  landmarkName?: string;
  slug?: string;
  urduPreview?: string;
  section?: UrduSection;
};

/** English source + Urdu translation (bundled copy, then API, never English in Urdu block). */
export async function getBilingualContent(
  englishText: string,
  options?: BilingualOptions,
): Promise<BilingualContent> {
  const english = englishText.trim();
  const section = options?.section ?? "summary";
  const key = cacheKey(english, options?.landmarkName, options?.slug, section);
  const hit = cache.get(key);
  if (hit) return hit;

  let urdu = "";

  if (options?.urduPreview && isValidUrduText(options.urduPreview)) {
    urdu = options.urduPreview.trim();
  }

  if (!urdu) {
    const bundled = resolveBundledUrdu(options?.slug, section, options?.landmarkName);
    if (isValidUrduText(bundled)) urdu = bundled;
  }

  if (!urdu && english) {
    const apiUrdu = await fetchTranslation(english);
    if (apiUrdu) urdu = apiUrdu;
  }

  if (!isValidUrduText(urdu)) {
    urdu = getGenericUrduSection(section);
  }

  const result: BilingualContent = { english, urdu };
  cache.set(key, result);
  return result;
}

export async function getTextForSpeech(
  englishText: string,
  lang: ContentLanguage,
  options?: BilingualOptions,
): Promise<string> {
  const { english, urdu } = await getBilingualContent(englishText, options);
  return lang === "ur" ? urdu : english;
}
