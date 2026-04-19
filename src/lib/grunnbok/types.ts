export type GrunnbokHjemmelshaver =
  | { type: 'person'; navn: string }
  | { type: 'organisasjon'; navn: string; orgnummer: string | null };

export type GrunnbokOverdragelse = {
  rettsstiftelsesnummer: number | null;
  historisk: boolean;
  vederlag: {
    beloep: number;
    valuta: string | null;
  } | null;
  dokumentavgift: number | null;
  brukstype: string | null;
  erverver: GrunnbokHjemmelshaver[];
};

export type GrunnbokHeftelse = {
  rettsstiftelsesnummer: number | null;
  type: string | null;
  historisk: boolean;
  beloep: number | null;
};

export type GrunnbokData = {
  kilde: 'grunnbok';
  hentet: string;
  matrikkelnummer: string;
  hjemmelshaver: GrunnbokHjemmelshaver[] | null;
  skjermet: boolean;
  overdragelser: GrunnbokOverdragelse[];
  heftelser: GrunnbokHeftelse[];
  sistOverdratt: GrunnbokOverdragelse | null;
};

export type GrunnbokLookupParams = {
  kommunenummer: string;
  gardsnummer: number;
  bruksnummer: number;
  festenummer?: number;
  seksjonsnummer?: number;
};
