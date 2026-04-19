// Geonorge REST API response types
// API: https://ws.geonorge.no/adresser/v1/sok
// Docs: https://ws.geonorge.no/adresser/v1/

export type GeonorgeRepresentasjonspunkt = {
  epsg: string; // "EPSG:4258" = WGS84 lat/lon
  lat: number;
  lon: number;
};

export type GeonorgeAdresse = {
  adressenavn: string; // "Karl Johans gate"
  adressetekst: string; // "Karl Johans gate 1"
  adressetilleggsnavn: string | null;
  adressekode: number;
  nummer: number;
  bokstav: string;
  kommunenummer: string; // "0301" for Oslo
  kommunenavn: string; // "OSLO"
  gardsnummer: number;
  bruksnummer: number;
  festenummer: number;
  undernummer: number | null;
  bruksenhetsnummer: string[]; // ["H0101", "H0102", ...]
  objtype: 'Vegadresse' | 'Matrikkeladresse';
  poststed: string;
  postnummer: string;
  adressetekstutenadressetilleggsnavn: string;
  stedfestingverifisert: boolean;
  representasjonspunkt: GeonorgeRepresentasjonspunkt;
  oppdateringsdato: string; // ISO 8601
};

export type GeonorgeSokMetadata = {
  viserFra: number;
  viserTil: number;
  totaltAntallTreff: number;
  asciiKompatibel: boolean;
  sokeStreng: string;
  side: number;
  treffPerSide: number;
};

export type GeonorgeSokResponse = {
  metadata: GeonorgeSokMetadata;
  adresser: GeonorgeAdresse[];
};

// Simplified shape for internal use — adds derived matrikkelnummer string
export type AdresseResult = {
  adresseTekst: string; // "Karl Johans gate 1"
  kommune: {
    nummer: string; // "0301"
    navn: string; // "Oslo" (title-cased, not UPPERCASE)
  };
  matrikkelnummer: string; // "0301-62/161" or "0301-62/161/0/0" — formatted
  matrikkel: {
    gardsnummer: number;
    bruksnummer: number;
    festenummer: number;
    seksjonsnummer: number; // 0 if not sectioned (Geonorge doesn't return this)
  };
  husnummer: number;
  bokstav: string;
  postnummer: string;
  poststed: string;
  koordinater: {
    lat: number;
    lon: number;
  };
  objtype: string;
};
