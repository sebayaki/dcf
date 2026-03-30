import { PROTOCOLS } from "./protocols";
import { fetchMarketsByIds } from "./coingecko";
import { buildProtocolSnapshot } from "./aggregate";
import type { ProtocolSnapshot } from "./types";

export type ProtocolsPayload = {
  updatedAt: string;
  protocols: ProtocolSnapshot[];
};

/** Load all protocol snapshots in the browser (DefiLlama + CoinGecko). */
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
