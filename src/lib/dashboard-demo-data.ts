export interface DemoSavedProperty {
  id: string;
  slug: string;
  address: string;
  lat: number;
  lon: number;
  kommunenummer: string | null;
  postnummer: string | null;
  notes: string | null;
  savedAt: string;
}

export interface DemoPriceAlert {
  id: string;
  kommunenummer: string;
  postnummer: string | null;
  thresholdPct: number | null;
  lastNotifiedAt: string | null;
  active: boolean | null;
  createdAt: string;
}

export const demoSavedProperties: DemoSavedProperty[] = [
  {
    id: "demo-prop-1",
    slug: "karl-johans-gate-1-0154-oslo",
    address: "Karl Johans gate 1, Oslo",
    lat: 59.9127,
    lon: 10.7461,
    kommunenummer: "0301",
    postnummer: "0154",
    notes: "Min drømmeleilighet i sentrum",
    savedAt: "2026-04-17T10:00:00.000Z",
  },
  {
    id: "demo-prop-2",
    slug: "bryggen-12-5003-bergen",
    address: "Bryggen 12, Bergen",
    lat: 60.3966,
    lon: 5.3224,
    kommunenummer: "4601",
    postnummer: "5003",
    notes: "Jobber med å få råd",
    savedAt: "2026-04-08T10:00:00.000Z",
  },
  {
    id: "demo-prop-3",
    slug: "prinsens-gate-7-7011-trondheim",
    address: "Prinsens gate 7, Trondheim",
    lat: 63.4305,
    lon: 10.3951,
    kommunenummer: "5001",
    postnummer: "7011",
    notes: "Familien vokser, vurderer å flytte",
    savedAt: "2026-03-22T10:00:00.000Z",
  },
];

export const demoPriceAlerts: DemoPriceAlert[] = [
  {
    id: "demo-alert-1",
    kommunenummer: "0301",
    postnummer: null,
    thresholdPct: 5,
    lastNotifiedAt: null,
    active: true,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "demo-alert-2",
    kommunenummer: "4601",
    postnummer: null,
    thresholdPct: 3,
    lastNotifiedAt: "2026-04-16T10:00:00.000Z",
    active: true,
    createdAt: "2026-02-10T10:00:00.000Z",
  },
];
