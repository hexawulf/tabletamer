// TT-08: an edit keeps the row in place until the next sort; CSV export escapes
// formula-triggering cells.
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Papa from "papaparse";
import { TableProvider, useTableContext } from "./TableContext";

function harness() {
  const api: { current: ReturnType<typeof useTableContext> | null } = { current: null };
  function Probe() {
    api.current = useTableContext();
    return null;
  }
  render(
    <TableProvider>
      <Probe />
    </TableProvider>,
  );
  return api;
}

const file = (text: string) => new File([text], "edit.csv", { type: "text/csv" });

beforeEach(() => localStorage.clear());

describe("TT-08: edit keeps the row in place", () => {
  it("editing a numeric cell in a sorted view does not re-sort the row away", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(file("n\n1\n2\n3\n"));
    });
    // Sort ascending by n: rows are 1,2,3.
    await act(async () => api.current!.updateSort("n"));
    expect(api.current!.filteredRows.map((r) => String(r.n))).toEqual(["1", "2", "3"]);

    // Edit the first row's value to 99. It must stay in position 0, not jump
    // to the end, until the user sorts again.
    await act(async () => api.current!.editCell(0, "n", "99"));
    expect(String(api.current!.filteredRows[0].n)).toBe("99");

    // Re-sorting now moves it to the end and sorts numerically.
    await act(async () => api.current!.updateSort("n")); // toggles to desc
    await act(async () => api.current!.updateSort("n")); // back to asc
    expect(api.current!.filteredRows.map((r) => String(r.n))).toEqual(["2", "3", "99"]);
  });
});

describe("TT-08: CSV export escapes formulae", () => {
  it("a cell starting with = is neutralised by escapeFormulae", () => {
    const rows = [{ a: "=1+1", b: "safe" }];
    const out = Papa.unparse(rows, { escapeFormulae: true });
    // escapeFormulae prefixes the dangerous cell so Excel will not evaluate it.
    expect(out).toMatch(/'?=1\+1|"'=1\+1"/);
    expect(out).not.toMatch(/\n=1\+1/); // not left as a bare leading =
  });
});
