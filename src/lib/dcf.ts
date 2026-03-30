export type DcfInputs = {
  /** Annualized gross fees / revenue proxy (USD) */
  baseAnnualGrossFees: number;
  /** Maps gross fees to normalized “owner earnings” (0–1) */
  profitMargin: number;
  /** Share of earnings attributable to token value (0–1) */
  tokenCaptureRate: number;
  /** Per-year growth during explicit forecast (e.g. 0.15 = 15%) */
  revenueCagr: number;
  /** Discount rate (e.g. 0.18) */
  discountRate: number;
  /** Gordon growth after explicit period; must be < discountRate */
  terminalGrowth: number;
  /** Number of explicit forecast years */
  horizonYears: number;
};

export type DcfResult = {
  baseAnnualFcf: number;
  pvExplicit: number;
  pvTerminal: number;
  enterpriseValue: number;
};

/**
 * Two-stage DCF: explicit geometric growth, then Gordon terminal growth.
 * FCF_t = baseFcf * (1+g)^t for t = 1..n; terminal on FCF_{n+1}.
 */
export function computeDcf(inputs: DcfInputs): DcfResult {
  const {
    baseAnnualGrossFees,
    profitMargin,
    tokenCaptureRate,
    revenueCagr,
    discountRate,
    terminalGrowth,
    horizonYears,
  } = inputs;

  const g = revenueCagr;
  const r = discountRate;
  const gT = terminalGrowth;
  const n = Math.max(0, Math.floor(horizonYears));

  if (r <= gT) {
    throw new Error("discountRate must be greater than terminalGrowth");
  }

  const margin = clamp01(profitMargin);
  const capture = clamp01(tokenCaptureRate);
  const baseFcf = Math.max(0, baseAnnualGrossFees) * margin * capture;

  let pvExplicit = 0;
  for (let t = 1; t <= n; t++) {
    const fcf = baseFcf * Math.pow(1 + g, t);
    pvExplicit += fcf / Math.pow(1 + r, t);
  }

  const fcfN = baseFcf * Math.pow(1 + g, n);
  const fcfN1 = fcfN * (1 + gT);
  const terminalValue = fcfN1 / (r - gT);
  const pvTerminal = terminalValue / Math.pow(1 + r, n);

  return {
    baseAnnualFcf: baseFcf,
    pvExplicit,
    pvTerminal,
    enterpriseValue: pvExplicit + pvTerminal,
  };
}

/** Sensitivity: vary discount rate by +/- delta (percentage points as decimal, e.g. 0.02). */
export function dcfSensitivity(
  base: DcfInputs,
  delta: number
): {
  discountRateMinus: DcfResult;
  base: DcfResult;
  discountRatePlus: DcfResult;
} {
  return {
    discountRateMinus: computeDcf({
      ...base,
      discountRate: Math.max(
        base.terminalGrowth + 1e-6,
        base.discountRate - delta
      ),
    }),
    base: computeDcf(base),
    discountRatePlus: computeDcf({
      ...base,
      discountRate: base.discountRate + delta,
    }),
  };
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}
