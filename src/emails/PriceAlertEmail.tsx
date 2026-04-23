import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface PriceAlertEmailProps {
  kommuneName: string;
  changePct: number;
  thresholdPct: number;
  previousValue: number;
  currentValue: number;
  dashboardUrl: string;
  manageUrl: string;
  unsubscribeUrl: string;
}

const accent = "#0E3B34";
const accentSoft = "#7FE3D4";
const text = "#0F1A18";
const textMuted = "#5C6B68";
const border = "#E6ECEA";
const bg = "#F5F8F7";

export function PriceAlertEmail({
  kommuneName,
  changePct,
  thresholdPct,
  previousValue,
  currentValue,
  dashboardUrl,
  manageUrl,
  unsubscribeUrl,
}: PriceAlertEmailProps) {
  const sign = changePct >= 0 ? "+" : "−";
  const magnitude = Math.abs(changePct);
  const changeText = `${sign}${formatNb(magnitude, 1)} %`;
  const preview = `Prisendring i ${kommuneName}: ${changeText} siden siste varsel.`;

  return (
    <Html lang="nb">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={brandStyle}>Verdikart</Text>
          </Section>

          <Section style={cardStyle}>
            <Heading as="h1" style={headingStyle}>
              Prisendring i {kommuneName}: {changeText}
            </Heading>
            <Text style={paragraphStyle}>
              Boligprisene i {kommuneName} har endret seg {changeText} siden siste varsel.
              Denne endringen overskrider din varsels-terskel på {formatNb(thresholdPct, 1)} %.
            </Text>

            <Section style={valueBlockStyle}>
              <Text style={valueLabelStyle}>Sist registrerte verdi</Text>
              <Text style={valueNumberStyle}>{formatKr(previousValue)} kr/m²</Text>
              <Hr style={dividerStyle} />
              <Text style={valueLabelStyle}>Nå</Text>
              <Text style={valueNumberStyle}>{formatKr(currentValue)} kr/m²</Text>
            </Section>

            <Section style={ctaWrapperStyle}>
              <Button href={dashboardUrl} style={buttonStyle}>
                Se detaljer på Verdikart
              </Button>
            </Section>

            <Text style={disclaimerStyle}>
              Data fra SSB boligprisindeks, oppdateres kvartalsvis.
            </Text>
          </Section>

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              <Link href={manageUrl} style={footerLinkStyle}>
                Administrer varsler
              </Link>
              {" · "}
              <Link href={unsubscribeUrl} style={footerLinkStyle}>
                Meld av
              </Link>
            </Text>
            <Text style={footerFineStyle}>
              Du mottar denne e-posten fordi du har aktivert prisvarsler for {kommuneName} på Verdikart.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PriceAlertEmail;

function formatKr(value: number): string {
  if (!Number.isFinite(value)) return "–";
  return Math.round(value).toLocaleString("nb-NO");
}

function formatNb(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "–";
  return value.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const bodyStyle = {
  backgroundColor: bg,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  color: text,
  margin: 0,
  padding: "32px 16px",
} as const;

const containerStyle = {
  maxWidth: "560px",
  margin: "0 auto",
} as const;

const headerStyle = {
  padding: "0 4px 16px",
} as const;

const brandStyle = {
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: accent,
  margin: 0,
} as const;

const cardStyle = {
  backgroundColor: "#FFFFFF",
  border: `1px solid ${border}`,
  borderRadius: "12px",
  padding: "32px",
} as const;

const headingStyle = {
  fontSize: "22px",
  lineHeight: 1.25,
  fontWeight: 600,
  color: text,
  margin: "0 0 16px",
} as const;

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: 1.55,
  color: text,
  margin: "0 0 24px",
} as const;

const valueBlockStyle = {
  backgroundColor: bg,
  border: `1px solid ${border}`,
  borderRadius: "10px",
  padding: "20px 24px",
  margin: "0 0 28px",
} as const;

const valueLabelStyle = {
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: textMuted,
  margin: "0 0 4px",
} as const;

const valueNumberStyle = {
  fontSize: "20px",
  fontWeight: 600,
  color: text,
  margin: 0,
} as const;

const dividerStyle = {
  borderColor: border,
  margin: "14px 0",
} as const;

const ctaWrapperStyle = {
  padding: "0 0 16px",
} as const;

const buttonStyle = {
  display: "inline-block",
  backgroundColor: accent,
  color: "#FFFFFF",
  textDecoration: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 600,
  boxShadow: `0 0 0 1px ${accentSoft}`,
} as const;

const disclaimerStyle = {
  fontSize: "12px",
  color: textMuted,
  margin: "8px 0 0",
} as const;

const footerStyle = {
  padding: "20px 4px 0",
  textAlign: "center" as const,
} as const;

const footerTextStyle = {
  fontSize: "13px",
  color: textMuted,
  margin: "0 0 8px",
} as const;

const footerLinkStyle = {
  color: accent,
  textDecoration: "underline",
} as const;

const footerFineStyle = {
  fontSize: "11px",
  color: textMuted,
  margin: 0,
} as const;
