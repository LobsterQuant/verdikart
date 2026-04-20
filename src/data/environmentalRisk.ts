export type RiskLevel = "Høy" | "Moderat" | "Lav" | "Ukjent";

export interface EnvironmentalRisk {
  kommunenummer: string;
  radonRisk: RiskLevel;
  radonNote?: string;
  floodRisk: RiskLevel;
  floodNote?: string;
}

export const environmentalRiskData: Record<string, EnvironmentalRisk> = {
  "0301": {
    kommunenummer: "0301",
    radonRisk: "Høy",
    radonNote: "Alunskifer i grunnen gir forhøyet radonkonsentrasjon i Oslo, særlig i østlige bydeler. Mål alltid radonnivå ved kjøp.",
    floodRisk: "Moderat",
    floodNote: "Flomrisiko langs Akerselva og i lavtliggende strøk. Se NVE flomsonekart for din adresse.",
  },
  "4601": {
    kommunenummer: "4601",
    radonRisk: "Moderat",
    floodRisk: "Høy",
    floodNote: "Bergen har Norges høyeste nedbør og risiko for stormflom og overvann. Sjekk NVE flomsonekart.",
  },
  "5001": {
    kommunenummer: "5001",
    radonRisk: "Moderat",
    floodRisk: "Moderat",
    floodNote: "Noe flomrisiko langs Nidelva og lavtliggende områder i Trondheim.",
  },
  "1103": {
    kommunenummer: "1103",
    radonRisk: "Lav",
    floodRisk: "Moderat",
    floodNote: "Noe flomrisiko i lavereliggende kyststrøk og langs Gandsfjorden.",
  },
  "5401": { kommunenummer: "5401", radonRisk: "Lav", floodRisk: "Lav" },
  "4204": { kommunenummer: "4204", radonRisk: "Lav", floodRisk: "Moderat" },
  "3004": {
    kommunenummer: "3004",
    radonRisk: "Høy",
    radonNote: "Østfold er et av Norges høyeste risikoområder for radon på grunn av granittgrunn.",
    floodRisk: "Moderat",
  },
  "3005": {
    kommunenummer: "3005",
    radonRisk: "Høy",
    radonNote: "Drammen og Buskerud har mye granittgrunn med høy radongassforekomst.",
    floodRisk: "Høy",
    floodNote: "Drammen ligger ved Drammensfjorden og Drammenselva: historisk flomrisiko ved flom og snøsmelting.",
  },
  "1108": { kommunenummer: "1108", radonRisk: "Lav", floodRisk: "Lav" },
  "1507": { kommunenummer: "1507", radonRisk: "Lav", floodRisk: "Moderat" },
  "3024": {
    kommunenummer: "3024",
    radonRisk: "Høy",
    radonNote: "Bærum har alunskifer- og granittgrunn. Radon er en reell risiko: mål alltid ved kjøp.",
    floodRisk: "Lav",
  },
  "3025": {
    kommunenummer: "3025",
    radonRisk: "Høy",
    radonNote: "Asker har granittrik grunn. Radonnivåer bør alltid måles.",
    floodRisk: "Lav",
  },
  "1804": { kommunenummer: "1804", radonRisk: "Lav", floodRisk: "Lav" },
  "3403": {
    kommunenummer: "3403",
    radonRisk: "Høy",
    radonNote: "Innlandet og Hamar-regionen har utbredt granittgrunn med forhøyet radonnivå.",
    floodRisk: "Høy",
    floodNote: "Hamar ligger ved Mjøsa: historisk flomrisiko ved snøsmelting og ekstremnedbør.",
  },
  "3803": { kommunenummer: "3803", radonRisk: "Moderat", floodRisk: "Lav" },
  "3003": {
    kommunenummer: "3003",
    radonRisk: "Høy",
    radonNote: "Sarpsborg ligger i Østfold med granittgrunn: høy radonrisiko.",
    floodRisk: "Moderat",
    floodNote: "Noe flomrisiko langs Glomma.",
  },
  "3807": {
    kommunenummer: "3807",
    radonRisk: "Moderat",
    floodRisk: "Moderat",
    floodNote: "Noe flomrisiko langs Porsgrunnselva og Hjellevannet.",
  },
  "4203": { kommunenummer: "4203", radonRisk: "Lav", floodRisk: "Moderat", floodNote: "Noe risiko for stormflom langs kysten." },
};
