const BASE = "https://api.llama.fi";

export type FeesSummary = {
  id: string;
  name: string;
  logo?: string;
  total24h?: number | null;
  total7d?: number | null;
  total30d?: number | null;
  totalAllTime?: number | null;
  /** [timestamp, dailyFees][] */
  totalDataChart?: [number, number][];
};

export async function fetchFeesSummary(
  slug: string,
  init?: RequestInit
): Promise<FeesSummary> {
  const res = await fetch(`${BASE}/summary/fees/${encodeURIComponent(slug)}`, {
    ...init,
  });
  if (!res.ok) {
    throw new Error(`DefiLlama fees ${slug}: ${res.status}`);
  }
  return res.json() as Promise<FeesSummary>;
}

/** Annualized USD from trailing 30d protocol fees (DefiLlama definition). */
export function annualizedFeesFrom30d(
  total30d: number | null | undefined
): number {
  if (total30d == null || Number.isNaN(total30d)) return 0;
  return (total30d / 30) * 365;
}
