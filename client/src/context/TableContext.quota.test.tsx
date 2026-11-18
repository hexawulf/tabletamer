// TT-01: a localStorage quota error must not crash the provider.
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

function csvFile(text: string, name = "big.csv") {
  return new File([text], name, { type: "text/csv" });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TT-01: localStorage quota is handled, not thrown", () => {
  it("a setItem that throws QuotaExceededError does not propagate", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      const err = new DOMException("quota", "QuotaExceededError");
      throw err;
    });

    const api = harness();
    // Loading triggers the save effect, which must swallow the quota error.
    await act(async () => {
      await api.current!.loadCSV(csvFile("a,b\n1,2\n3,4\n"));
    });

    // Data is still in memory and usable.
    expect(api.current!.hasData).toBe(true);
    expect(api.current!.data).toHaveLength(2);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it("restore from the old key still works when storage is healthy", async () => {
    localStorage.setItem(
      "tableTamerData",
      JSON.stringify({ data: [{ a: "1", b: "2" }], columns: ["a", "b"], fileName: "old.csv" }),
    );
    const api = harness();
    await act(async () => {});
    expect(api.current!.hasData).toBe(true);
    expect(api.current!.data).toHaveLength(1);
  });
});
