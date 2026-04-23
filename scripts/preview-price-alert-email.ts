/**
 * scripts/preview-price-alert-email.ts
 *
 * Renders the PriceAlertEmail template to HTML with sample data and writes
 * it to tmp/price-alert-email.html for local preview.
 *
 *   npx tsx scripts/preview-price-alert-email.ts
 *
 * Not wired into CI. Not sent anywhere. Purely a dev helper.
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { render } from "@react-email/render";
import { PriceAlertEmail } from "../src/emails/PriceAlertEmail";

async function main() {
  const html = await render(
    PriceAlertEmail({
      kommuneName: "Oslo",
      changePct: 6.3,
      thresholdPct: 5,
      previousValue: 80_000,
      currentValue: 85_000,
      dashboardUrl: "https://verdikart.no/dashboard",
      manageUrl: "https://verdikart.no/dashboard",
      unsubscribeUrl: "https://verdikart.no/dashboard",
    }),
  );

  const outDir = resolve(__dirname, "..", "tmp");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "price-alert-email.html");
  writeFileSync(outPath, html);
  console.log(`wrote ${outPath} (${html.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
