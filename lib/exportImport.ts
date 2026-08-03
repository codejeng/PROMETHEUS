const STORAGE_PREFIX = "prometheus-";

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    }
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2);
}

export function downloadExport() {
  const json = exportAllData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prometheus-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string): void {
  const parsed = JSON.parse(json);
  const data = parsed.data ?? parsed;
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
}
