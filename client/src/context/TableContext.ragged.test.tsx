// TT-03: field-count mismatches warn but do not reject the whole file.
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

const file = (text: string) => new File([text], "ragged.csv", { type: "text/csv" });

beforeEach(() => localStorage.clear());

describe("TT-03: ragged rows are loaded, not rejected", () => {
  it("a row with too few fields still loads", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(file("a,b,c\n1,2,3\n4,5\n6,7,8\n"));
    });
    expect(api.current!.hasData).toBe(true);
    expect(api.current!.data.length).toBeGreaterThanOrEqual(2);
  });

  it("a trailing-comma row still loads", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(file("a,b\n1,2\n3,4,\n"));
    });
    expect(api.current!.hasData).toBe(true);
    expect(api.current!.data.length).toBeGreaterThanOrEqual(2);
  });
});
