import { terminalGrowthMax, type DcfUiState } from "@/lib/dcfPresets";

type MaxFn = (d: DcfUiState) => number;

export type DcfSliderField = {
  key: keyof DcfUiState;
  label: string;
  min: number;
  max: number | MaxFn;
  step: number;
  format: (v: number) => string;
};

export const DCF_SLIDER_FIELDS: DcfSliderField[] = [
  {
    key: "profitMargin",
    label: "Profit margin (revenue → earnings proxy)",
    min: 0.05,
    max: 0.9,
    step: 0.01,
    format: (v) => `${(v * 100).toFixed(0)}%`,
  },
  {
    key: "tokenCaptureRate",
    label: "Token capture (share of earnings to token value)",
    min: 0.01,
    max: 1,
    step: 0.01,
    format: (v) => `${(v * 100).toFixed(0)}%`,
  },
  {
    key: "revenueCagr",
    label: "Revenue CAGR (forecast period)",
    min: -0.2,
    max: 0.5,
    step: 0.01,
    format: (v) => `${(v * 100).toFixed(0)}%`,
  },
  {
    key: "discountRate",
    label: "Discount rate",
    min: 0.08,
    max: 0.4,
    step: 0.005,
    format: (v) => `${(v * 100).toFixed(1)}%`,
  },
  {
    key: "terminalGrowth",
    label: "Terminal growth (Gordon)",
    min: 0,
    max: (d) => terminalGrowthMax(d.discountRate),
    step: 0.0025,
    format: (v) => `${(v * 100).toFixed(1)}%`,
  },
  {
    key: "horizonYears",
    label: "Forecast horizon (years)",
    min: 3,
    max: 10,
    step: 1,
    format: (v) => `${Math.round(v)} yr`,
  },
];
