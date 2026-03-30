import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { computeDcf, dcfSensitivity, type DcfInputs } from "@/lib/dcf";
import {
  DEFAULT_DCF_UI,
  PRESETS,
  type DcfUiState,
  type ScenarioName,
} from "@/lib/dcfPresets";
import {
  fetchAllProtocols,
  type ProtocolsPayload,
} from "@/lib/fetchProtocols";

const STORAGE_DCF = "dcf-deFi-ui";
const STORAGE_OVERRIDES = "dcf-deFi-overrides";
const STORAGE_SCENARIO = "dcf-deFi-scenario-name";

type Overrides = {
  annualFeesUsd?: number;
  fdvUsd?: number;
};

function formatUsd(n: number | null | undefined, compact = false): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function initialScenario(): ScenarioName {
  if (typeof window === "undefined") return "base";
  const s = loadJson(STORAGE_SCENARIO, "base" as ScenarioName);
  return s === "conservative" || s === "base" || s === "optimistic" ? s : "base";
}

export function DeFiDcfDashboard() {
  const [data, setData] = useState<ProtocolsPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dcf, setDcf] = useState<DcfUiState>(() =>
    typeof window !== "undefined"
      ? loadJson(STORAGE_DCF, DEFAULT_DCF_UI)
      : DEFAULT_DCF_UI
  );
  const [scenario, setScenario] = useState<ScenarioName>(initialScenario);
  const [overrides, setOverrides] = useState<Record<string, Overrides>>(() =>
    typeof window !== "undefined" ? loadJson(STORAGE_OVERRIDES, {}) : {}
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchAllProtocols();
        if (!cancelled) {
          setData(json);
          setSelectedId((prev) => prev ?? json.protocols[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistDcf = useCallback((next: DcfUiState) => {
    setDcf(next);
    localStorage.setItem(STORAGE_DCF, JSON.stringify(next));
  }, []);

  const persistOverrides = useCallback((next: Record<string, Overrides>) => {
    setOverrides(next);
    localStorage.setItem(STORAGE_OVERRIDES, JSON.stringify(next));
  }, []);

  const applyPreset = (name: ScenarioName) => {
    setScenario(name);
    localStorage.setItem(STORAGE_SCENARIO, name);
    persistDcf(PRESETS[name]);
  };

  const dcfInputsBase = useCallback(
    (grossAnnual: number): DcfInputs => ({
      baseAnnualGrossFees: grossAnnual,
      profitMargin: dcf.profitMargin,
      tokenCaptureRate: dcf.tokenCaptureRate,
      revenueCagr: dcf.revenueCagr,
      discountRate: dcf.discountRate,
      terminalGrowth: dcf.terminalGrowth,
      horizonYears: Math.round(dcf.horizonYears),
    }),
    [dcf]
  );

  const rows = useMemo(() => {
    if (!data) return [];
    return data.protocols.map((p) => {
      const o = overrides[p.id] ?? {};
      const rawFees = p.fees.annualizedFees30d;
      const gross =
        o.annualFeesUsd ??
        (p.fees.error ? 0 : rawFees);
      const fdv = o.fdvUsd ?? p.market.fdv ?? null;
      let ev = 0;
      let ratio: number | null = null;
      try {
        const r = computeDcf(dcfInputsBase(gross));
        ev = r.enterpriseValue;
        if (fdv != null && fdv > 0) ratio = ev / fdv;
      } catch {
        ev = 0;
        ratio = null;
      }
      return {
        snapshot: p,
        effectiveGrossAnnual: gross,
        effectiveFdv: fdv,
        enterpriseValue: ev,
        intrinsicToFdv: ratio,
        hasFeesIssue: Boolean(p.fees.error),
        hasMarketIssue: fdv == null || Boolean(p.market.error),
      };
    });
  }, [data, overrides, dcfInputsBase]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ar = a.intrinsicToFdv ?? -1;
      const br = b.intrinsicToFdv ?? -1;
      return br - ar;
    });
  }, [rows]);

  const selected = sorted.find((r) => r.snapshot.id === selectedId) ?? sorted[0];

  const chartData = useMemo(() => {
    if (!selected) return [];
    return selected.snapshot.feesChart.map(([ts, v]) => ({
      t: ts * 1000,
      fees: v,
      date: new Date(ts * 1000).toISOString().slice(0, 10),
    }));
  }, [selected]);

  const sensitivity = useMemo(() => {
    if (!selected) return null;
    const gross = selected.effectiveGrossAnnual;
    try {
      return dcfSensitivity(dcfInputsBase(gross), 0.02);
    } catch {
      return null;
    }
  }, [selected, dcfInputsBase]);

  const updateOverride = (id: string, patch: Partial<Overrides>) => {
    const next = {
      ...overrides,
      [id]: { ...overrides[id], ...patch },
    };
    if (
      next[id]?.annualFeesUsd === undefined &&
      next[id]?.fdvUsd === undefined
    ) {
      delete next[id];
    }
    persistOverrides(next);
  };

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-sm">
        Failed to load data: {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground py-16 text-center text-sm">
        Loading protocol data from DefiLlama and CoinGecko…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          DeFi DCF Valuation
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          This tool approximates intrinsic value using DefiLlama protocol fees
          (30-day annualized) and CoinGecko FDV under the assumptions below.{" "}
          <strong className="font-medium text-zinc-700 dark:text-zinc-300">
            This is not investment advice
          </strong>
          . Results are highly sensitive to inputs. Cash flows and token
          economics differ materially by protocol.
        </p>
        <p className="text-xs text-zinc-400">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 w-full">
          Scenario presets
        </span>
        {(
          [
            ["conservative", "Conservative"],
            ["base", "Base"],
            ["optimistic", "Optimistic"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={`rounded-full px-3 py-1 text-sm border transition ${
              scenario === key
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DcfSlider
          label="Profit margin (revenue → earnings proxy)"
          value={dcf.profitMargin}
          min={0.05}
          max={0.9}
          step={0.01}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={(v) => persistDcf({ ...dcf, profitMargin: v })}
        />
        <DcfSlider
          label="Token capture (share of earnings to token value)"
          value={dcf.tokenCaptureRate}
          min={0.01}
          max={1}
          step={0.01}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={(v) => persistDcf({ ...dcf, tokenCaptureRate: v })}
        />
        <DcfSlider
          label="Revenue CAGR (forecast period)"
          value={dcf.revenueCagr}
          min={-0.2}
          max={0.5}
          step={0.01}
          format={(v) => `${(v * 100).toFixed(0)}%`}
          onChange={(v) => persistDcf({ ...dcf, revenueCagr: v })}
        />
        <DcfSlider
          label="Discount rate"
          value={dcf.discountRate}
          min={0.08}
          max={0.4}
          step={0.005}
          format={(v) => `${(v * 100).toFixed(1)}%`}
          onChange={(v) => persistDcf({ ...dcf, discountRate: v })}
        />
        <DcfSlider
          label="Terminal growth (Gordon)"
          value={dcf.terminalGrowth}
          min={0}
          max={Math.min(0.06, dcf.discountRate - 0.01)}
          step={0.0025}
          format={(v) => `${(v * 100).toFixed(1)}%`}
          onChange={(v) => persistDcf({ ...dcf, terminalGrowth: v })}
        />
        <DcfSlider
          label="Forecast horizon (years)"
          value={dcf.horizonYears}
          min={3}
          max={10}
          step={1}
          format={(v) => `${Math.round(v)} yr`}
          onChange={(v) => persistDcf({ ...dcf, horizonYears: v })}
        />
      </section>

      <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Token</th>
              <th className="px-3 py-2">Annualized fees (30d)</th>
              <th className="px-3 py-2">FDV</th>
              <th className="px-3 py-2">Implied EV</th>
              <th className="px-3 py-2">EV / FDV</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.snapshot.id}
                className={`cursor-pointer border-t border-zinc-100 dark:border-zinc-800 ${
                  selected?.snapshot.id === r.snapshot.id
                    ? "bg-emerald-500/5"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
                onClick={() => setSelectedId(r.snapshot.id)}
              >
                <td className="px-3 py-2 font-medium">
                  <div className="flex items-center gap-2">
                    {r.snapshot.market.image ? (
                      <img
                        src={r.snapshot.market.image}
                        alt=""
                        className="h-6 w-6 rounded-full"
                      />
                    ) : null}
                    <span>
                      {r.snapshot.symbol}{" "}
                      <span className="text-zinc-500 font-normal">
                        {r.snapshot.name}
                      </span>
                    </span>
                  </div>
                  {(r.hasFeesIssue || r.hasMarketIssue) && (
                    <span className="mt-0.5 block text-[10px] text-amber-600">
                      Incomplete data — manual override available
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatUsd(r.effectiveGrossAnnual, true)}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatUsd(r.effectiveFdv, true)}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatUsd(r.enterpriseValue, true)}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">
                  {r.intrinsicToFdv != null
                    ? r.intrinsicToFdv.toFixed(2) + "×"
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <h2 className="text-lg font-medium">
              {selected.snapshot.name} ({selected.snapshot.symbol})
            </h2>
            {selected.snapshot.note && (
              <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-md p-2">
                {selected.snapshot.note}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <div className="text-zinc-500 text-xs">Annualized fees (default)</div>
                <div className="font-mono">
                  {formatUsd(selected.snapshot.fees.annualizedFees30d)}
                </div>
                {selected.snapshot.fees.error && (
                  <div className="text-xs text-red-500 mt-1">
                    API: {selected.snapshot.fees.error}
                  </div>
                )}
              </div>
              <div>
                <div className="text-zinc-500 text-xs">FDV (default)</div>
                <div className="font-mono">
                  {formatUsd(selected.snapshot.market.fdv)}
                </div>
                {selected.snapshot.market.error && (
                  <div className="text-xs text-red-500 mt-1">
                    {selected.snapshot.market.error}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
              <h3 className="text-sm font-medium">Manual overrides (USD)</h3>
              <p className="text-xs text-zinc-500">
                Use when auto values are missing or unreliable. Leave blank to
                use API values.
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col gap-1 text-xs">
                  Annualized revenue / fees
                  <input
                    type="number"
                    className="rounded border border-zinc-300 dark:border-zinc-600 bg-transparent px-2 py-1 font-mono text-sm w-40"
                    placeholder="Auto"
                    value={
                      overrides[selected.snapshot.id]?.annualFeesUsd ?? ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      updateOverride(selected.snapshot.id, {
                        annualFeesUsd:
                          v === "" ? undefined : Number.parseFloat(v),
                      });
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  FDV
                  <input
                    type="number"
                    className="rounded border border-zinc-300 dark:border-zinc-600 bg-transparent px-2 py-1 font-mono text-sm w-40"
                    placeholder="Auto"
                    value={overrides[selected.snapshot.id]?.fdvUsd ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateOverride(selected.snapshot.id, {
                        fdvUsd: v === "" ? undefined : Number.parseFloat(v),
                      });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <h3 className="text-sm font-medium mb-2">
                Discount-rate sensitivity (±2 pp)
              </h3>
              {sensitivity ? (
                <div className="text-sm space-y-1 font-mono">
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">Discount −2 pp</span>
                    <span>
                      {formatUsd(sensitivity.discountRateMinus.enterpriseValue)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">Base</span>
                    <span>
                      {formatUsd(sensitivity.base.enterpriseValue)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-500">Discount +2 pp</span>
                    <span>
                      {formatUsd(sensitivity.discountRatePlus.enterpriseValue)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Cannot compute (check assumptions)
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 min-h-[280px]">
            <h3 className="text-sm font-medium mb-4">Daily fees (recent window)</h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No chart data (DefiLlama time series may be empty for some
                chains or protocols).
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(v as number)
                    }
                  />
                  <Tooltip
                    formatter={(v) => [
                      formatUsd(typeof v === "number" ? v : Number(v)),
                      "Fees",
                    ]}
                    labelFormatter={(l) => String(l)}
                  />
                  <Line
                    type="monotone"
                    dataKey="fees"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function DcfSlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const { label, value, min, max, step, format, onChange } = props;
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          className="flex-1 accent-emerald-600"
        />
        <span className="w-16 text-right font-mono text-[11px]">
          {format(value)}
        </span>
      </div>
    </label>
  );
}
