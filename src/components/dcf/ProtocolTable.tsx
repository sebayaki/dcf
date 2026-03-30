import type { DashboardTableRow } from "@/lib/types";
import { formatUsd } from "@/utils/format";

type Props = {
  rows: DashboardTableRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ProtocolTable({ rows, selectedId, onSelect }: Props) {
  return (
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
          {rows.map((r) => (
            <tr
              key={r.snapshot.id}
              className={`cursor-pointer border-t border-zinc-100 dark:border-zinc-800 ${
                selectedId === r.snapshot.id
                  ? "bg-emerald-500/5"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
              onClick={() => onSelect(r.snapshot.id)}
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
                  ? `${r.intrinsicToFdv.toFixed(2)}×`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
