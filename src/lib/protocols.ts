/**
 * Token ↔ DefiLlama fees slug ↔ CoinGecko id mapping.
 * Slugs verified against api.llama.fi/summary/fees/{slug} and CoinGecko.
 */
export type ProtocolRow = {
  id: string;
  symbol: string;
  name: string;
  defillamaSlug: string;
  coinGeckoId: string;
  /** Short note when cash-flow linkage is weak */
  note?: string;
};

export const PROTOCOLS: ProtocolRow[] = [
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    defillamaSlug: "uniswap",
    coinGeckoId: "uniswap",
  },
  {
    id: "aave",
    symbol: "AAVE",
    name: "Aave",
    defillamaSlug: "aave",
    coinGeckoId: "aave",
  },
  {
    id: "jupiter",
    symbol: "JUP",
    name: "Jupiter",
    defillamaSlug: "jupiter",
    coinGeckoId: "jupiter-exchange-solana",
  },
  {
    id: "hyperliquid",
    symbol: "HYPE",
    name: "Hyperliquid",
    defillamaSlug: "hyperliquid",
    coinGeckoId: "hyperliquid",
  },
  {
    id: "lido",
    symbol: "LDO",
    name: "Lido",
    defillamaSlug: "lido",
    coinGeckoId: "lido-dao",
  },
  {
    id: "morpho",
    symbol: "MORPHO",
    name: "Morpho",
    defillamaSlug: "morpho",
    coinGeckoId: "morpho",
  },
  {
    id: "ethena",
    symbol: "ENA",
    name: "Ethena",
    defillamaSlug: "ethena",
    coinGeckoId: "ethena",
  },
  {
    id: "monad",
    symbol: "MON",
    name: "Monad",
    defillamaSlug: "monad",
    coinGeckoId: "monad",
    note: "Fees may reflect chain-level activity; token–revenue link is uncertain.",
  },
  {
    id: "maple",
    symbol: "SYRUP",
    name: "Maple Finance",
    defillamaSlug: "maple",
    coinGeckoId: "syrup",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    defillamaSlug: "chainlink",
    coinGeckoId: "chainlink",
    note: "Oracle / staking economics differ from fee-based DEX models.",
  },
  {
    id: "pancakeswap",
    symbol: "CAKE",
    name: "PancakeSwap",
    defillamaSlug: "pancakeswap",
    coinGeckoId: "pancakeswap-token",
  },
  {
    id: "aerodrome",
    symbol: "AERO",
    name: "Aerodrome",
    defillamaSlug: "aerodrome",
    coinGeckoId: "aerodrome-finance",
  },
  {
    id: "curve",
    symbol: "CRV",
    name: "Curve",
    defillamaSlug: "curve-finance",
    coinGeckoId: "curve-dao-token",
  },
  {
    id: "sky",
    symbol: "SKY",
    name: "Sky (ex-Maker)",
    defillamaSlug: "sky",
    coinGeckoId: "sky",
  },
  {
    id: "gmx",
    symbol: "GMX",
    name: "GMX",
    defillamaSlug: "gmx",
    coinGeckoId: "gmx",
  },
  {
    id: "pendle",
    symbol: "PENDLE",
    name: "Pendle",
    defillamaSlug: "pendle",
    coinGeckoId: "pendle",
  },
  {
    id: "eigenlayer",
    symbol: "EIGEN",
    name: "EigenLayer",
    defillamaSlug: "eigenlayer",
    coinGeckoId: "eigenlayer",
  },
];

export function getProtocolById(id: string): ProtocolRow | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}
