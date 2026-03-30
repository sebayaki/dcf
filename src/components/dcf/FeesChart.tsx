import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactNumber, formatUsd } from "@/utils/format";

type Point = { date: string; fees: number };

type Props = {
  data: Point[];
};

export function FeesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No chart data (DefiLlama time series may be empty for some chains or
        protocols).
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => formatCompactNumber(v as number)}
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
  );
}
