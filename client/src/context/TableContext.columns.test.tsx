// TT-10: toggleColumnVisibility must not hide the last column and must not
// toast from inside the state updater (so no double-fire under StrictMode).
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

const file = (text: string) => new File([text], "cols.csv", { type: "text/csv" });

beforeEach(() => localStorage.clear());

describe("TT-10: column visibility", () => {
  it("hiding one of two columns works; hiding the last is refused", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(file("a,b\n1,2\n"));
    });
    expect(api.current!.visibleColumns).toEqual(["a", "b"]);

    await act(async () => api.current!.toggleColumnVisibility("a"));
    expect(api.current!.visibleColumns).toEqual(["b"]);

    // Hiding the last visible column is refused (one column stays visible).
    await act(async () => api.current!.toggleColumnVisibility("b"));
    expect(api.current!.visibleColumns).toEqual(["b"]);

    // Toggling a hidden column back on works.
    await act(async () => api.current!.toggleColumnVisibility("a"));
    expect(api.current!.visibleColumns.sort()).toEqual(["a", "b"]);
  });
});
