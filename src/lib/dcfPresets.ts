import type { DcfInputs } from "./dcf";

/** Gordon terminal g cap: below discount rate and a hard ceiling (matches slider). */
export function terminalGrowthMax(discountRate: number): number {
  return Math.min(0.06, discountRate - 0.01);
}

/** Clamp terminal growth so DCF inputs stay feasible (Gordon needs g less than r). */
export function sanitizeDcf(ui: DcfUiState): DcfUiState {
  const cap = terminalGrowthMax(ui.discountRate);
  if (ui.terminalGrowth > cap) {
    return { ...ui, terminalGrowth: cap };
  }
  return ui;
}

export type ScenarioName = "conservative" | "base" | "optimistic";

export type DcfUiState = Pick<
  DcfInputs,
  | "profitMargin"
  | "tokenCaptureRate"
  | "revenueCagr"
  | "discountRate"
  | "terminalGrowth"
  | "horizonYears"
>;

export const DEFAULT_DCF_UI: DcfUiState = {
  profitMargin: 0.35,
  tokenCaptureRate: 0.2,
  revenueCagr: 0.12,
  discountRate: 0.2,
  terminalGrowth: 0.025,
  horizonYears: 5,
};

export const SCENARIO_OPTIONS: { id: ScenarioName; label: string }[] = [
  { id: "conservative", label: "Conservative" },
  { id: "base", label: "Base" },
  { id: "optimistic", label: "Optimistic" },
];

export const PRESETS: Record<ScenarioName, DcfUiState> = {
  conservative: {
    profitMargin: 0.25,
    tokenCaptureRate: 0.12,
    revenueCagr: 0.06,
    discountRate: 0.26,
    terminalGrowth: 0.015,
    horizonYears: 5,
  },
  base: { ...DEFAULT_DCF_UI },
  optimistic: {
    profitMargin: 0.45,
    tokenCaptureRate: 0.3,
    revenueCagr: 0.2,
    discountRate: 0.14,
    terminalGrowth: 0.035,
    horizonYears: 7,
  },
};
