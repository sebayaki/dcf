import type { DcfResult } from "@/lib/dcf";
import type { DashboardTableRow, ProtocolOverride } from "@/lib/types";
import { formatUsd } from "@/utils/format";
import { FeesChart } from "./FeesChart";

type Sensitivity = {
  discountRateMinus: DcfResult;
  base: DcfResult;
  discountRatePlus: DcfResult;
};

type Props = {
  row: DashboardTableRow;
  overrides: Record<string, ProtocolOverride>;
  onOverrideChange: (id: string, patch: Partial<ProtocolOverride>) => void;
  sensitivity: Sensitivity | null;
  chartData: { date: string; fees: number }[];
};

export function ProtocolDetailPanel({
  row,
  overrides,
  onOverrideChange,
  sensitivity,
  chartData,
}: Props) {
  const id = row.snapshot.id;
  const o = overrides[id] ?? {};

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-lg font-medium">
          {row.snapshot.name} ({row.snapshot.symbol})
        </h2>
        {row.snapshot.note && (
          <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-md p-2">
            {row.snapshot.note}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-zinc-500 text-xs">
              Annualized fees (default)
            </div>
            <div className="font-mono">
              {formatUsd(row.snapshot.fees.annualizedFees30d)}
            </div>
            {row.snapshot.fees.error && (
              <div className="text-xs text-red-500 mt-1">
                API: {row.snapshot.fees.error}
              </div>
            )}
          </div>
          <div>
            <div className="text-zinc-500 text-xs">FDV (default)</div>
            <div className="font-mono">
              {formatUsd(row.snapshot.market.fdv)}
            </div>
            {row.snapshot.market.error && (
              <div className="text-xs text-red-500 mt-1">
                {row.snapshot.market.error}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
          <h3 className="text-sm font-medium">Manual overrides (USD)</h3>
          <p className="text-xs text-zinc-500">
            Use when auto values are missing or unreliable. Leave blank to use
            API values.
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-xs">
              Annualized revenue / fees
              <input
                type="number"
                className="dcf-input"
                placeholder="Auto"
                value={o.annualFeesUsd ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  onOverrideChange(id, {
                    annualFeesUsd: v === "" ? undefined : Number.parseFloat(v),
                  });
                }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              FDV
              <input
                type="number"
                className="dcf-input"
                placeholder="Auto"
                value={o.fdvUsd ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  onOverrideChange(id, {
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
                <span>{formatUsd(sensitivity.base.enterpriseValue)}</span>
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
        <FeesChart data={chartData} />
      </div>
    </section>
  );
}
