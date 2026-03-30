import { computeDcf, type DcfInputs } from "./dcf";
import type {
  ProtocolSnapshot,
  ProtocolOverride,
  DashboardTableRow,
} from "./types";

export function buildDashboardRows(
  protocols: ProtocolSnapshot[],
  overrides: Record<string, ProtocolOverride>,
  makeDcfInputs: (grossAnnual: number) => DcfInputs
): DashboardTableRow[] {
  return protocols.map((p) => {
    const o = overrides[p.id] ?? {};
    const rawFees = p.fees.annualizedFees30d;
    const gross = o.annualFeesUsd ?? (p.fees.error ? 0 : rawFees);
    const fdv = o.fdvUsd ?? p.market.fdv ?? null;
    let enterpriseValue = 0;
    let intrinsicToFdv: number | null = null;
    try {
      const r = computeDcf(makeDcfInputs(gross));
      enterpriseValue = r.enterpriseValue;
      if (fdv != null && fdv > 0) intrinsicToFdv = enterpriseValue / fdv;
    } catch {
      enterpriseValue = 0;
      intrinsicToFdv = null;
    }
    return {
      snapshot: p,
      effectiveGrossAnnual: gross,
      effectiveFdv: fdv,
      enterpriseValue,
      intrinsicToFdv,
      hasFeesIssue: Boolean(p.fees.error),
      hasMarketIssue: fdv == null || Boolean(p.market.error),
    };
  });
}

export function sortRowsByIntrinsicToFdv(
  rows: DashboardTableRow[]
): DashboardTableRow[] {
  return [...rows].sort((a, b) => {
    const ar = a.intrinsicToFdv ?? -1;
    const br = b.intrinsicToFdv ?? -1;
    return br - ar;
  });
}
