import type { DcfSliderField } from "./sliderConfig";

type Props = {
  field: DcfSliderField;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

export function DcfSlider({ field, value, max, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-zinc-600 dark:text-zinc-400">{field.label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={field.min}
          max={max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          className="flex-1 accent-emerald-600"
        />
        <span className="w-16 text-right font-mono text-[11px]">
          {field.format(value)}
        </span>
      </div>
    </label>
  );
}
