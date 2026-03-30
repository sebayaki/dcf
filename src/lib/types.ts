export type ProtocolFeesBlock = {
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  annualizedFees30d: number;
  error?: string;
};

export type ProtocolMarketBlock = {
  fdv: number | null;
  price: number | null;
  marketCap: number | null;
  image?: string;
  error?: string;
};

export type ProtocolSnapshot = {
  id: string;
  symbol: string;
  name: string;
  note?: string;
  defillamaSlug: string;
  coinGeckoId: string;
  fees: ProtocolFeesBlock;
  market: ProtocolMarketBlock;
  /** Last ~120 daily points [unixSec, feesUsd] */
  feesChart: [number, number][];
};

export type ProtocolOverride = {
  annualFeesUsd?: number;
  fdvUsd?: number;
};

export type ProtocolsPayload = {
  updatedAt: string;
  protocols: ProtocolSnapshot[];
};

export type DashboardTableRow = {
  snapshot: ProtocolSnapshot;
  effectiveGrossAnnual: number;
  effectiveFdv: number | null;
  enterpriseValue: number;
  intrinsicToFdv: number | null;
  hasFeesIssue: boolean;
  hasMarketIssue: boolean;
};
