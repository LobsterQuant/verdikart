/**
 * Kartverket Grunnbok / Matrikkel types.
 * Stub — ready for when the API becomes available.
 */

export interface OwnershipRecord {
  name: string;
  registeredDate: string;
  share: string;
}

export interface MatrikkelData {
  gaardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
  tomteareal: number | null;       // m²
  byggeaar: number | null;
  antallEtasjer: number | null;
  bruksareal: number | null;       // m² (BRA)
  eierhistorikk: OwnershipRecord[];
  tinglysteDokumenter: string[];
}

export const EMPTY_MATRIKKEL: MatrikkelData = {
  gaardsnummer: 0,
  bruksnummer: 0,
  tomteareal: null,
  byggeaar: null,
  antallEtasjer: null,
  bruksareal: null,
  eierhistorikk: [],
  tinglysteDokumenter: [],
};
