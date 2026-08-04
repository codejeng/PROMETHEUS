// Generic camelCase <-> snake_case conversion for top-level object keys.
// Every Supabase table column is named as the snake_case form of its
// TypeScript field (e.g. `currentProgress` <-> `current_progress`), and
// array/object-valued fields are stored as JSONB blobs that preserve
// their original camelCase shape untouched — so this only ever needs to
// convert one level deep.

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toRow<T extends object>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[camelToSnake(k)] = v;
  }
  return out;
}

export function fromRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out as T;
}
