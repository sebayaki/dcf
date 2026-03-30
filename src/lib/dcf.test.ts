import { describe, expect, it } from "vitest";
import { computeDcf } from "./dcf";

describe("computeDcf", () => {
  it("matches manual PV for n=1, zero growth, zero terminal growth edge", () => {
    const r = 0.1;
    const baseFcf = 100;
    const gross = baseFcf; // margin 1, capture 1
    const res = computeDcf({
      baseAnnualGrossFees: gross,
      profitMargin: 1,
      tokenCaptureRate: 1,
      revenueCagr: 0,
      discountRate: r,
      terminalGrowth: 0.01,
      horizonYears: 1,
    });
    // FCF1 = 100, PV_exp = 100/1.1, TV from FCF2 = 100*1.01, TV = 101/(0.1-0.01), PV_TV = TV/1.1
    const pv1 = 100 / 1.1;
    const fcf2 = 100 * 1.01;
    const tv = fcf2 / (0.1 - 0.01);
    const pvTv = tv / 1.1;
    expect(res.pvExplicit).toBeCloseTo(pv1, 6);
    expect(res.pvTerminal).toBeCloseTo(pvTv, 6);
    expect(res.enterpriseValue).toBeCloseTo(pv1 + pvTv, 6);
  });

  it("throws when terminal growth >= discount", () => {
    expect(() =>
      computeDcf({
        baseAnnualGrossFees: 1000,
        profitMargin: 1,
        tokenCaptureRate: 1,
        revenueCagr: 0.05,
        discountRate: 0.1,
        terminalGrowth: 0.11,
        horizonYears: 5,
      })
    ).toThrow();
  });

  it("scales down with margin and capture", () => {
    const full = computeDcf({
      baseAnnualGrossFees: 1000,
      profitMargin: 1,
      tokenCaptureRate: 1,
      revenueCagr: 0,
      discountRate: 0.12,
      terminalGrowth: 0.02,
      horizonYears: 3,
    });
    const half = computeDcf({
      baseAnnualGrossFees: 1000,
      profitMargin: 0.5,
      tokenCaptureRate: 1,
      revenueCagr: 0,
      discountRate: 0.12,
      terminalGrowth: 0.02,
      horizonYears: 3,
    });
    expect(half.enterpriseValue).toBeCloseTo(full.enterpriseValue * 0.5, 6);
  });
});
