const BASE = "https://api.coingecko.com/api/v3";

export type CoinMarketRow = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  price_change_percentage_24h: number | null;
  image_url?: string;
};

export async function fetchMarketsByIds(
  ids: string[],
  init?: RequestInit
): Promise<CoinMarketRow[]> {
  if (ids.length === 0) return [];
  const url = new URL(`${BASE}/coins/markets`);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("per_page", "250");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko markets: ${res.status}`);
  }
  const data = (await res.json()) as Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number | null;
    market_cap: number | null;
    fully_diluted_valuation: number | null;
    total_volume: number | null;
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
    price_change_percentage_24h: number | null;
  }>;
  return data.map((x) => ({
    id: x.id,
    symbol: x.symbol,
    name: x.name,
    current_price: x.current_price,
    market_cap: x.market_cap,
    fully_diluted_valuation: x.fully_diluted_valuation,
    total_volume: x.total_volume,
    circulating_supply: x.circulating_supply,
    total_supply: x.total_supply,
    max_supply: x.max_supply,
    price_change_percentage_24h: x.price_change_percentage_24h,
    image_url: x.image,
  }));
}
