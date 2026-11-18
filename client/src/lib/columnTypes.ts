// Column type detection and a typed comparator (TT-04).
//
// Ported from the old lib/csvUtils.detectColumnTypes, then extended so sorting
// is stable and type-aware. Values are strings (TT-02 disabled dynamicTyping),
// so detection and comparison work on string content.
//
// Date choice: ISO (YYYY-MM-DD) is parsed as-is. For slash/dash dd?/mm?/yyyy
// forms we read them as DAY-FIRST (DD/MM/YYYY), which matches the operator's
// locale; an ambiguous value like 03/04/2026 is treated as 3 April 2026.

export type ColumnType = "integer" | "decimal" | "date" | "boolean" | "string" | "unknown";

const DATE_ISO = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?$/;
const DATE_SLASH = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
const BOOLEANS = new Set(["true", "false", "yes", "no"]);

const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

export function parseDateValue(value: unknown): number | null {
  if (isBlank(value)) return null;
  const s = String(value).trim();
  if (DATE_ISO.test(s)) {
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : t;
  }
  const m = DATE_SLASH.exec(s);
  if (m) {
    // Day-first interpretation.
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const t = new Date(year, month - 1, day).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function detectColumnType(values: unknown[]): ColumnType {
  const nonBlank = values.filter((v) => !isBlank(v));
  if (nonBlank.length === 0) return "unknown";

  const allNumbers = nonBlank.every((v) => {
    const s = String(v).trim();
    return s !== "" && !Number.isNaN(Number(s)) && Number.isFinite(Number(s));
  });
  if (allNumbers) {
    const allInts = nonBlank.every((v) => Number.isInteger(Number(String(v).trim())));
    return allInts ? "integer" : "decimal";
  }

  const allDates = nonBlank.every((v) => parseDateValue(v) !== null);
  if (allDates) return "date";

  const allBooleans = nonBlank.every((v) => BOOLEANS.has(String(v).trim().toLowerCase()));
  if (allBooleans) return "boolean";

  return "string";
}

export function detectColumnTypes(
  rows: Record<string, unknown>[],
  columns: string[],
  sampleSize = 100,
): Record<string, ColumnType> {
  const sample = rows.slice(0, Math.min(rows.length, sampleSize));
  const types: Record<string, ColumnType> = {};
  columns.forEach((col) => {
    types[col] = detectColumnType(sample.map((r) => r[col]));
  });
  return types;
}

const boolRank = (v: unknown): number => {
  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "yes") return 1;
  return 0;
};

// Comparator for one column given its detected type. Blanks always sort last,
// in both directions. Returns the asc-order comparison; the caller negates for
// desc (except blanks, which the wrapper keeps last).
export function compareByType(
  type: ColumnType,
  a: unknown,
  b: unknown,
): number {
  switch (type) {
    case "integer":
    case "decimal":
      return Number(String(a).trim()) - Number(String(b).trim());
    case "date": {
      const da = parseDateValue(a);
      const db = parseDateValue(b);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    }
    case "boolean":
      return boolRank(a) - boolRank(b);
    default:
      // Mixed/string: locale compare, numbers within strings handled naturally.
      return String(a).localeCompare(String(b), undefined, { numeric: true });
  }
}

// Sort rows by a column with a known type. Blank cells are forced last
// regardless of direction.
export function sortRowsByType<T extends Record<string, unknown>>(
  rows: T[],
  column: string,
  direction: "asc" | "desc",
  type: ColumnType,
): T[] {
  return [...rows].sort((rowA, rowB) => {
    const a = rowA[column];
    const b = rowB[column];
    const aBlank = isBlank(a);
    const bBlank = isBlank(b);
    if (aBlank && bBlank) return 0;
    if (aBlank) return 1; // blanks last
    if (bBlank) return -1;
    const cmp = compareByType(type, a, b);
    return direction === "asc" ? cmp : -cmp;
  });
}
