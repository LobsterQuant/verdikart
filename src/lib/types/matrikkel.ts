/**
 * Kartverket Grunnbok / Matrikkel types.
 *
 * Grunnbok (land registry): ownership, encumbrances, registered documents.
 * Matrikkel (cadastre):     building year, area, floors — separate API, not yet available.
 */

export interface OwnershipRecord {
  name: string;
  registeredDate: string;
  share: string;
}

export interface HeftelseRecord {
  type: string;
  belop: number | null;
  kreditor: string | null;
  registeredDate: string;
}

export interface GrunnbokData {
  eierhistorikk: OwnershipRecord[];
  heftelser: HeftelseRecord[];
  tinglysteDokumenter: string[];
}

export const EMPTY_GRUNNBOK: GrunnbokData = {
  eierhistorikk: [],
  heftelser: [],
  tinglysteDokumenter: [],
};

export interface MatrikkelData {
  gaardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
  /** Matrikkel API fields — null until that API is integrated */
  tomteareal: number | null;       // m²
  byggeaar: number | null;
  antallEtasjer: number | null;
  bruksareal: number | null;       // m² (BRA)
  /** Grunnbok data — ownership, encumbrances, documents */
  grunnbok: GrunnbokData;
}

export const EMPTY_MATRIKKEL: MatrikkelData = {
  gaardsnummer: 0,
  bruksnummer: 0,
  tomteareal: null,
  byggeaar: null,
  antallEtasjer: null,
  bruksareal: null,
  grunnbok: EMPTY_GRUNNBOK,
};
