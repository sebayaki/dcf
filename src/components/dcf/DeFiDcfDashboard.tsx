import type { DcfUiState } from "@/lib/dcfPresets";
import { SCENARIO_OPTIONS } from "@/lib/dcfPresets";
import { useDeFiDcfDashboard } from "@/hooks/useDeFiDcfDashboard";
import { DcfSlider } from "./DcfSlider";
import { ProtocolDetailPanel } from "./ProtocolDetailPanel";
import { ProtocolTable } from "./ProtocolTable";
import { DCF_SLIDER_FIELDS } from "./sliderConfig";

export function DeFiDcfDashboard() {
  const {
    data,
    loadError,
    selectedId,
    setSelectedId,
    dcf,
    scenario,
    applyPreset,
    patchDcf,
    sortedRows,
    selected,
    chartData,
    sensitivity,
    updateOverride,
    overrides,
  } = useDeFiDcfDashboard();

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
          (30-day annualized) and CoinGecko FDV under the assumptions below.
          The DCF output is a stylized enterprise-style value of fee cash flows;
          comparing it to token FDV mixes protocol economics with market cap and
          is only a rough heuristic.{" "}
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
        {SCENARIO_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id)}
            className={`rounded-full px-3 py-1 text-sm border transition ${
              scenario === id
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DCF_SLIDER_FIELDS.map((field) => {
          const max =
            typeof field.max === "function" ? field.max(dcf) : field.max;
          const value = dcf[field.key];
          return (
            <DcfSlider
              key={field.key}
              field={field}
              value={value}
              max={max}
              onChange={(v) =>
                patchDcf({ [field.key]: v } as Partial<DcfUiState>)
              }
            />
          );
        })}
      </section>

      <ProtocolTable
        rows={sortedRows}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selected && (
        <ProtocolDetailPanel
          row={selected}
          overrides={overrides}
          onOverrideChange={updateOverride}
          sensitivity={sensitivity}
          chartData={chartData}
        />
      )}
    </div>
  );
}
