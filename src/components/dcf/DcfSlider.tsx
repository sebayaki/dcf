import type { DcfSliderField } from "./sliderConfig";

type Props = {
  field: DcfSliderField;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function DcfSlider({ field, value, max, onChange }: Props) {
  const min = field.min;
  const safeMax = max >= min ? max : min;
  const clamped = clamp(value, min, safeMax);

  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-zinc-600 dark:text-zinc-400">{field.label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="range"
          min={min}
          max={safeMax}
          step={field.step}
          value={clamped}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          className="min-w-0 w-full flex-1 accent-emerald-600"
        />
        <span className="w-16 shrink-0 text-right font-mono text-[11px]">
          {field.format(clamped)}
        </span>
      </div>
    </label>
  );
}
