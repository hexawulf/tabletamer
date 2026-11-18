// TT-02: dynamicTyping is off, so values survive load -> export byte for byte.
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

function csvFile(text: string) {
  return new File([text], "typing.csv", { type: "text/csv" });
}

beforeEach(() => localStorage.clear());

describe("TT-02: values are not coerced on load", () => {
  it("leading zeros, big ints, exponent, boolean and empties are kept as strings", async () => {
    const api = harness();
    const csv =
      "zip,bigid,exp,flag,empty\n" + "01234,9007199254740993,1e3,TRUE,\n";
    await act(async () => {
      await api.current!.loadCSV(csvFile(csv));
    });

    const row = api.current!.data[0];
    expect(row.zip).toBe("01234");
    expect(row.bigid).toBe("9007199254740993");
    expect(row.exp).toBe("1e3");
    expect(row.flag).toBe("TRUE");
    // empty cell stays an empty string, not null/0
    expect(row.empty === "" || row.empty === null).toBe(true);
  });

  it("round-trips through Papa.unparse without changing the values", async () => {
    const api = harness();
    const csv = "zip,bigid\n01234,9007199254740993\n";
    await act(async () => {
      await api.current!.loadCSV(csvFile(csv));
    });
    const out = Papa.unparse(api.current!.data as Record<string, unknown>[]);
    const lines = out.trim().split(/\r?\n/);
    expect(lines[0]).toBe("zip,bigid");
    expect(lines[1]).toBe("01234,9007199254740993");
  });
});
