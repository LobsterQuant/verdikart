/**
 * Display-name overrides for NSR (Nasjonalt skoleregister) entries.
 *
 * NSR stores some school names with diacritics and apostrophes stripped
 * (e.g. "Lycee Francais Rene Cassin Doslo" for "Lycée Français René Cassin
 * d'Oslo"). We can't fix the upstream register, so we maintain this small
 * override table keyed by NSRId. Keys are the authoritative NSR ID so the
 * mapping doesn't drift if NSR later corrects the stored name.
 *
 * Only add an entry when the upstream name is clearly wrong — never to
 * editorialise school names.
 */
export const NSR_DISPLAY_NAME_OVERRIDES: Readonly<Record<number, string>> = {
  // NSR 1008405 — "Lycee Francais Rene Cassin Doslo"
  1008405: "Lycée Français René Cassin d'Oslo",
  // NSR 1006281 — "Lycee Francais Rene Cassin avd Vidregående skole"
  1006281: "Lycée Français René Cassin, avd. videregående skole",
  // NSR 1002231 — "Association Du Lycee Francais Rene Cassin D'oslo"
  1002231: "Association du Lycée Français René Cassin d'Oslo",
};

export function displayNameForNsrId(nsrId: number | null | undefined, fallback: string): string {
  if (nsrId == null) return fallback;
  return NSR_DISPLAY_NAME_OVERRIDES[nsrId] ?? fallback;
}
