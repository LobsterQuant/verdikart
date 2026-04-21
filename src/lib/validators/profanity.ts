// Minimum-bar profanity filter. Strips diacritics before matching so
// bypasses like "fück" or "drítt" still get caught.
//
// Note: this is NOT a full moderation system — a proper AI-based filter
// is a separate initiative. Keep the list short and conservative.
const FORBIDDEN = ["fuck", "faen", "jævla", "hore", "dritt"];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const NORMALIZED_FORBIDDEN = FORBIDDEN.map(normalize);

export function containsForbidden(text: string): boolean {
  const normalized = normalize(text);
  return NORMALIZED_FORBIDDEN.some((w) => normalized.includes(w));
}
