import { useCallback, useEffect, useMemo, useState } from "react";
import { dcfSensitivity, type DcfInputs } from "@/lib/dcf";
import {
  DEFAULT_DCF_UI,
  PRESETS,
  type DcfUiState,
  type ScenarioName,
} from "@/lib/dcfPresets";
import {
  buildDashboardRows,
  sortRowsByIntrinsicToFdv,
} from "@/lib/dashboardRows";
import { fetchAllProtocols } from "@/lib/protocolData";
import type { ProtocolOverride, ProtocolsPayload } from "@/lib/types";
import { readJson, writeJson, STORAGE_KEYS } from "@/utils/storage";

function initialScenario(): ScenarioName {
  if (typeof window === "undefined") return "base";
  const s = readJson(STORAGE_KEYS.scenario, "base" as ScenarioName);
  return s === "conservative" || s === "base" || s === "optimistic"
    ? s
    : "base";
}

export function useDeFiDcfDashboard() {
  const [data, setData] = useState<ProtocolsPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dcf, setDcf] = useState<DcfUiState>(() =>
    typeof window !== "undefined"
      ? readJson(STORAGE_KEYS.dcf, DEFAULT_DCF_UI)
      : DEFAULT_DCF_UI
  );
  const [scenario, setScenario] = useState<ScenarioName>(initialScenario);
  const [overrides, setOverrides] = useState<Record<string, ProtocolOverride>>(
    () =>
      typeof window !== "undefined" ? readJson(STORAGE_KEYS.overrides, {}) : {}
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
    writeJson(STORAGE_KEYS.dcf, next);
  }, []);

  const applyPreset = useCallback(
    (name: ScenarioName) => {
      setScenario(name);
      writeJson(STORAGE_KEYS.scenario, name);
      persistDcf(PRESETS[name]);
    },
    [persistDcf]
  );

  const makeDcfInputs = useCallback(
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
    return buildDashboardRows(data.protocols, overrides, makeDcfInputs);
  }, [data, overrides, makeDcfInputs]);

  const sortedRows = useMemo(() => sortRowsByIntrinsicToFdv(rows), [rows]);

  const selected =
    sortedRows.find((r) => r.snapshot.id === selectedId) ?? sortedRows[0];

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
      return dcfSensitivity(makeDcfInputs(gross), 0.02);
    } catch {
      return null;
    }
  }, [selected, makeDcfInputs]);

  const updateOverride = useCallback(
    (id: string, patch: Partial<ProtocolOverride>) => {
      setOverrides((prev) => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } };
        if (
          next[id]?.annualFeesUsd === undefined &&
          next[id]?.fdvUsd === undefined
        ) {
          delete next[id];
        }
        writeJson(STORAGE_KEYS.overrides, next);
        return next;
      });
    },
    []
  );

  const patchDcf = useCallback(
    (patch: Partial<DcfUiState>) => {
      persistDcf({ ...dcf, ...patch });
    },
    [dcf, persistDcf]
  );

  return {
    data,
    loadError,
    selectedId,
    setSelectedId,
    dcf,
    scenario,
    overrides,
    applyPreset,
    patchDcf,
    sortedRows,
    selected,
    chartData,
    sensitivity,
    updateOverride,
  };
}
