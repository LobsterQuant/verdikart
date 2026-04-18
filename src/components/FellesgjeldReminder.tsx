import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * A contextual reminder card shown on property reports, prompting users
 * to check fellesgjeld (shared debt) before bidding.
 * Shown only when the property is likely in a borettslag/sameie context —
 * we can't know for certain without matrikkel data, so we show it always
 * as a useful reminder.
 */
export default function FellesgjeldReminder() {
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-amber-200">Husk å sjekke fellesgjeld</h3>
      </div>
      <p className="text-sm leading-relaxed text-amber-100/80">
        Er boligen i et borettslag eller sameie? Din andel av{" "}
        <strong className="text-amber-100">fellesgjelden</strong> legges til kjøpesummen og
        påvirker den reelle kostnaden. Høy fellesgjeld = høyere månedlige felleskostnader og
        større renterisiko.
      </p>
      <div className="mt-3 flex flex-col gap-1.5 text-xs text-amber-100/70">
        <p>
          <span className="font-medium text-amber-200">Se etter i prospektet:</span> «Andel
          fellesgjeld», «IN-ordning» og planlagte rehabiliteringer.
        </p>
        <p>
          <span className="font-medium text-amber-200">Tommelfingerregel:</span> fellesgjeld over
          50 % av kjøpesummen er et varseltegn.
        </p>
      </div>
      <Link
        href="/blogg/fellesgjeld-forklart"
        className="mt-3 inline-block text-xs font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200 transition-colors"
      >
        Les mer: Fellesgjeld forklart →
      </Link>
    </div>
  );
}
