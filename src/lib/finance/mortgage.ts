import { INDICATIVE_RATE, STRESS_TEST_ADDER, STRESS_TEST_MINIMUM } from "./constants";

/**
 * Calculate monthly payment for annuity loan.
 * Returns monthly amount in NOK.
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  years: number,
): number {
  if (loanAmount <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return Math.round(loanAmount / numPayments);

  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return Math.round(monthlyPayment);
}

/**
 * Stress rate: actual + 3pp, minimum 7%.
 */
export function getStressRate(annualRate: number): number {
  return Math.max(annualRate + STRESS_TEST_ADDER, STRESS_TEST_MINIMUM);
}

/**
 * Main calculation combining all costs.
 */
export interface MonthlyCostInput {
  purchasePrice: number;
  equityPercent: number; // 0.15 to 0.30
  loanYears: number; // 15 to 30
  felleskostnader: number; // monthly NOK
  eiendomsskatt: number; // monthly NOK, from commune data
}

export interface MonthlyCostResult {
  loanAmount: number;
  mortgageMonthly: number;
  mortgageStressed: number;
  felleskostnader: number;
  eiendomsskatt: number;
  totalMonthly: number;
  totalStressed: number;
  rate: number;
  stressRate: number;
}

export function calculateMonthlyCost(input: MonthlyCostInput): MonthlyCostResult {
  const loanAmount = input.purchasePrice * (1 - input.equityPercent);
  const rate = INDICATIVE_RATE.nominal;
  const stressRate = getStressRate(rate);

  const mortgageMonthly = calculateMonthlyPayment(loanAmount, rate, input.loanYears);
  const mortgageStressed = calculateMonthlyPayment(loanAmount, stressRate, input.loanYears);

  const totalMonthly = mortgageMonthly + input.felleskostnader + input.eiendomsskatt;
  const totalStressed = mortgageStressed + input.felleskostnader + input.eiendomsskatt;

  return {
    loanAmount,
    mortgageMonthly,
    mortgageStressed,
    felleskostnader: input.felleskostnader,
    eiendomsskatt: input.eiendomsskatt,
    totalMonthly,
    totalStressed,
    rate,
    stressRate,
  };
}
