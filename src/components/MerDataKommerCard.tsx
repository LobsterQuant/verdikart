import { Compass } from "lucide-react";

export default function MerDataKommerCard() {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <Compass className="h-5 w-5 text-text-tertiary" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-text-secondary">Mer data kommer</h3>
      </div>
      <p className="text-sm text-text-secondary">
        Vi henter løpende nye data for denne adressen: støy, luftkvalitet, bredbånd og
        klimarisiko dekker i dag primært tettbygde strøk og hovedveier.
      </p>
      <p className="mt-2 text-xs text-text-secondary">
        Kilder: Kartverket, NILU, Nkom og NVE.
      </p>
    </div>
  );
}
