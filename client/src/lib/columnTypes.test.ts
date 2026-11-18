// TT-04: typed column detection and a typed, stable comparator.
import { describe, expect, it } from "vitest";
import { detectColumnType, sortRowsByType, parseDateValue } from "./columnTypes";

const col = (values: string[]) => values.map((v) => ({ c: v }));

describe("detectColumnType", () => {
  it("detects integer / decimal / date / boolean / string", () => {
    expect(detectColumnType(["1", "2", "3"])).toBe("integer");
    expect(detectColumnType(["1.5", "2", "3"])).toBe("decimal");
    expect(detectColumnType(["2026-01-02", "2024-12-31"])).toBe("date");
    expect(detectColumnType(["TRUE", "false", "Yes"])).toBe("boolean");
    expect(detectColumnType(["apple", "banana"])).toBe("string");
  });

  it("a column mixing numbers and text is a string", () => {
    expect(detectColumnType(["1", "two", "3"])).toBe("string");
  });
});

describe("sortRowsByType", () => {
  it("sorts numbers numerically, not lexically", () => {
    const rows = col(["10", "2", "1"]);
    const asc = sortRowsByType(rows, "c", "asc", "integer").map((r) => r.c);
    expect(asc).toEqual(["1", "2", "10"]);
  });

  it("empty cells sort last in both directions", () => {
    const rows = col(["3", "", "1", "2"]);
    const asc = sortRowsByType(rows, "c", "asc", "integer").map((r) => r.c);
    const desc = sortRowsByType(rows, "c", "desc", "integer").map((r) => r.c);
    expect(asc[asc.length - 1]).toBe("");
    expect(desc[desc.length - 1]).toBe("");
  });

  it("sorts ISO dates chronologically", () => {
    const rows = col(["2026-03-01", "2024-01-01", "2026-01-15"]);
    const asc = sortRowsByType(rows, "c", "asc", "date").map((r) => r.c);
    expect(asc).toEqual(["2024-01-01", "2026-01-15", "2026-03-01"]);
  });

  it("reads slash dates as day-first (DD/MM/YYYY)", () => {
    // 02/03/2026 => 2 Mar 2026; 10/01/2026 => 10 Jan 2026 => earlier.
    const rows = col(["02/03/2026", "10/01/2026"]);
    const asc = sortRowsByType(rows, "c", "asc", "date").map((r) => r.c);
    expect(asc).toEqual(["10/01/2026", "02/03/2026"]);
    expect(parseDateValue("10/01/2026")! < parseDateValue("02/03/2026")!).toBe(true);
  });

  it("mixed columns fall back to a locale numeric compare", () => {
    const rows = col(["item10", "item2", "item1"]);
    const asc = sortRowsByType(rows, "c", "asc", "string").map((r) => r.c);
    expect(asc).toEqual(["item1", "item2", "item10"]);
  });
});
