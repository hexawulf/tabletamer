// Characterization tests (TT-05): capture current parse / sort / edit / persist
// behaviour BEFORE the TT-01..TT-04/TT-08 changes, so later commits are
// deliberate. These assert what the code does today; some are updated by the
// later findings and the reason is noted there.
import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { TableProvider, useTableContext } from "./TableContext";

// Render the provider and hand the context object to the test via a ref.
function harness() {
  const api: { current: ReturnType<typeof useTableContext> | null } = { current: null };
  function Probe() {
    api.current = useTableContext();
    useEffect(() => {}, []);
    return null;
  }
  render(
    <TableProvider>
      <Probe />
    </TableProvider>,
  );
  return api;
}

function csvFile(text: string, name = "test.csv") {
  return new File([text], name, { type: "text/csv" });
}

beforeEach(() => {
  localStorage.clear();
});

describe("parse", () => {
  it("loads a simple CSV and exposes rows and columns", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(csvFile("a,b\n1,2\n3,4\n"));
    });
    expect(api.current!.columns).toEqual(["a", "b"]);
    expect(api.current!.data).toHaveLength(2);
    expect(api.current!.hasData).toBe(true);
  });
});

describe("persist", () => {
  it("writes the loaded table to localStorage", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(csvFile("a,b\n1,2\n"));
    });
    const saved = localStorage.getItem("tableTamerData");
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved as string);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.columns).toEqual(["a", "b"]);
  });

  it("restores a prior session from the old localStorage key", async () => {
    localStorage.setItem(
      "tableTamerData",
      JSON.stringify({ data: [{ a: "x", b: "y" }], columns: ["a", "b"], fileName: "old.csv" }),
    );
    const api = harness();
    // The restore effect runs on mount.
    await act(async () => {});
    expect(api.current!.hasData).toBe(true);
    expect(api.current!.data).toHaveLength(1);
  });
});

describe("edit", () => {
  it("editing a cell updates the underlying data", async () => {
    const api = harness();
    await act(async () => {
      await api.current!.loadCSV(csvFile("a,b\nhello,2\n"));
    });
    await act(async () => {
      api.current!.editCell(0, "a", "WORLD");
    });
    expect(api.current!.data[0].a).toBe("WORLD");
  });
});
