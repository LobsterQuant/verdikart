// Matrikkel SOAP response types — enriched data layer
// API: findAdresseInfoObjekter + BygningService + StoreService

export type MatrikkelBygning = {
  bygningsnummer: number;
  byggeaar: number | null;
  bruksareal: number | null; // m²
  bruksarealBolig: number | null; // m² boligdel
  bygningstype: string | null; // "Enebolig", "Tomannsbolig", "Rekkehus", etc.
  bygningstypeKode: string | null; // numeric code
  bygningsstatus: string | null; // "Tatt i bruk", "Godkjent", etc.
  antallEtasjer: number | null;
  antallBruksenheter: number;
};

export type MatrikkelBruksenhet = {
  bruksenhetsnummer: string; // "H0101"
  etasje: string | null; // "H", "U", "K", "L"
  etasjenummer: number | null;
  bruksareal: number | null; // m²
  bruksenhetstype: string | null; // "Bolig", "Annen"
  antallRom: number | null;
  antallBaderom: number | null;
};

export type MatrikkelEnhet = {
  matrikkelnummer: string; // "0301-62/161/0/0"
  kommunenummer: string;
  kommunenavn: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer: number;
  seksjonsnummer: number;
  matrikkelenhetstype: string | null; // "Grunneiendom", "Festegrunn", "Eierseksjon"
  erSeksjonert: boolean;
  totalBruksareal: number | null; // sum across all bygninger
  bygninger: MatrikkelBygning[];
  bruksenheter: MatrikkelBruksenhet[];
};

export type MatrikkelData = {
  kilde: 'matrikkel';
  hentet: string; // ISO timestamp
  enhet: MatrikkelEnhet;
  raw?: unknown; // kept for debugging in dev only
};

export type MatrikkelLookupParams = {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
};
