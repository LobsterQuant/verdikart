import { Resend } from "resend";
import { PriceAlertEmail } from "@/emails/PriceAlertEmail";

export interface SendPriceAlertEmailInput {
  to: string;
  kommuneName: string;
  changePct: number;
  thresholdPct: number;
  previousValue: number;
  currentValue: number;
}

const FROM = "Verdikart <varsler@mail.verdikart.no>";
const SITE_URL = "https://verdikart.no";

export async function sendPriceAlertEmail(input: SendPriceAlertEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const sign = input.changePct >= 0 ? "+" : "−";
  const magnitude = Math.abs(input.changePct).toLocaleString("nb-NO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const subject = `Prisendring i ${input.kommuneName}: ${sign}${magnitude} %`;

  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: FROM,
    to: input.to,
    subject,
    react: PriceAlertEmail({
      kommuneName: input.kommuneName,
      changePct: input.changePct,
      thresholdPct: input.thresholdPct,
      previousValue: input.previousValue,
      currentValue: input.currentValue,
      dashboardUrl: `${SITE_URL}/dashboard`,
      manageUrl: `${SITE_URL}/dashboard`,
      unsubscribeUrl: `${SITE_URL}/dashboard`,
    }),
  });
}
