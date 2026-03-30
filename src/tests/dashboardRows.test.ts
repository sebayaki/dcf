import { describe, expect, it } from "vitest";
import type { DcfInputs } from "@/lib/dcf";
import { buildDashboardRows } from "@/lib/dashboardRows";
import type { ProtocolSnapshot } from "@/lib/types";

const makeInputs = (gross: number): DcfInputs => ({
  baseAnnualGrossFees: gross,
  profitMargin: 1,
  tokenCaptureRate: 1,
  revenueCagr: 0,
  discountRate: 0.12,
  terminalGrowth: 0.02,
  horizonYears: 3,
});

const minimalSnapshot = (id: string): ProtocolSnapshot => ({
  id,
  symbol: "X",
  name: "X",
  defillamaSlug: "x",
  coinGeckoId: "x",
  fees: {
    total24h: null,
    total7d: null,
    total30d: 1000,
    annualizedFees30d: 12000,
  },
  market: { fdv: 100000, price: 1, marketCap: null },
  feesChart: [],
});

describe("buildDashboardRows", () => {
  it("maps protocols to valuation rows", () => {
    const rows = buildDashboardRows([minimalSnapshot("a")], {}, makeInputs);
    expect(rows).toHaveLength(1);
    expect(rows[0].snapshot.id).toBe("a");
    expect(rows[0].enterpriseValue).toBeGreaterThan(0);
  });
});
