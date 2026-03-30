/** localStorage keys — keep stable so user presets survive refactors */
export const STORAGE_KEYS = {
  dcf: "dcf-deFi-ui",
  overrides: "dcf-deFi-overrides",
  scenario: "dcf-deFi-scenario-name",
} as const;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
