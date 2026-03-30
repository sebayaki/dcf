import type { ProtocolRow } from "./protocols";
import { PROTOCOLS } from "./protocols";
import { fetchFeesSummary, annualizedFeesFrom30d } from "./api/defillama";
import { fetchMarketsByIds, type CoinMarketRow } from "./api/coingecko";
import type { ProtocolSnapshot, ProtocolsPayload } from "./types";

const CHART_MAX_POINTS = 120;

export async function fetchAllProtocols(): Promise<ProtocolsPayload> {
  const ids = PROTOCOLS.map((p) => p.coinGeckoId);
  const markets = await fetchMarketsByIds(ids);
  const marketById = new Map(markets.map((m) => [m.id, m]));
  const protocols = await Promise.all(
    PROTOCOLS.map((row) => buildProtocolSnapshot(row, marketById))
  );
  return {
    updatedAt: new Date().toISOString(),
    protocols,
  };
}

export async function buildProtocolSnapshot(
  row: ProtocolRow,
  marketById: Map<string, CoinMarketRow>
): Promise<ProtocolSnapshot> {
  let feesBlock: ProtocolSnapshot["fees"] = {
    total24h: null,
    total7d: null,
    total30d: null,
    annualizedFees30d: 0,
  };
  let chart: [number, number][] = [];

  try {
    const summary = await fetchFeesSummary(row.defillamaSlug);
    feesBlock = {
      total24h: summary.total24h ?? null,
      total7d: summary.total7d ?? null,
      total30d: summary.total30d ?? null,
      annualizedFees30d: annualizedFeesFrom30d(summary.total30d ?? 0),
    };
    const raw = summary.totalDataChart ?? [];
    chart = raw.slice(-CHART_MAX_POINTS) as [number, number][];
  } catch (e) {
    feesBlock = {
      ...feesBlock,
      error: e instanceof Error ? e.message : "fees fetch failed",
    };
  }

  const m = marketById.get(row.coinGeckoId);
  const marketBlock: ProtocolSnapshot["market"] = m
    ? {
        fdv: m.fully_diluted_valuation,
        price: m.current_price,
        marketCap: m.market_cap,
        image: m.image_url,
      }
    : {
        fdv: null,
        price: null,
        marketCap: null,
        error: "missing market data",
      };

  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    note: row.note,
    defillamaSlug: row.defillamaSlug,
    coinGeckoId: row.coinGeckoId,
    fees: feesBlock,
    market: marketBlock,
    feesChart: chart,
  };
}
