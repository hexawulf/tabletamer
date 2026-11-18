import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { detectColumnTypes, sortRowsByType, type ColumnType } from "@/lib/columnTypes";

type TableRow = Record<string, unknown>;
const STORAGE_KEY = "tableTamerData";
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = new Set([10, 25, 50, 100]);

const buildColumnVisibility = (columns: string[]) =>
  columns.reduce(
    (acc, column) => {
      acc[column] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

const getVisibleColumns = (columns: string[], columnVisibility: Record<string, boolean>) =>
  columns.filter((column) => columnVisibility[column] !== false);

const getExportRows = (rows: TableRow[], visibleColumns: string[]) =>
  rows.map((row) =>
    visibleColumns.reduce((acc, column) => {
      acc[column] = row[column];
      return acc;
    }, {} as TableRow),
  );

const downloadTextFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizeRows = (rows: unknown[]): TableRow[] =>
  rows
    .filter(
      (row): row is Record<string, unknown> =>
        !!row && typeof row === "object" && !Array.isArray(row),
    )
    .map((row) => {
      const normalized = { ...row } as TableRow & { __parsed_extra?: unknown };
      delete normalized.__parsed_extra;
      return normalized;
    });

const getColumnsFromRows = (rows: TableRow[]) => {
  const columnSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.trim()) {
        columnSet.add(key);
      }
    });
  });
  return Array.from(columnSet);
};

const getBaseFileName = (fileName: string) =>
  (fileName.trim() || "table-data").replace(/\.[^.]+$/, "");

interface TableData {
  data: TableRow[];
  columns: string[];
  columnTypes: Record<string, ColumnType>;
  columnVisibility: Record<string, boolean>;
  visibleColumns: string[];
  filteredRows: TableRow[];
  currentPage: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  searchQuery: string;
  fileName: string;
  hasData: boolean;
  isLoading: boolean;
}

interface CellEdit {
  rowIndex: number | null;
  column: string | null;
  value: string | null;
}

interface TableContextType extends TableData {
  loadCSV: (file: File) => Promise<void>;
  loadExampleData: () => Promise<void>;
  clearData: () => void;
  toggleColumnVisibility: (column: string) => void;
  resetColumnVisibility: () => void;
  updateSort: (column: string) => void;
  updateSearch: (query: string) => void;
  updatePageSize: (size: number) => void;
  updateCurrentPage: (page: number) => void;
  editCell: (rowIndex: number, column: string, value: string) => void;
  exportData: (format: "csv" | "json") => void;
  copyToClipboard: () => void;
  totalPages: number;
  paginatedRows: TableRow[];
  totalRowCount: number;
  filteredRowCount: number;
  setEditCell: (edit: CellEdit) => void;
  editingCell: CellEdit;
  transformCellValue: (type: "upper" | "lower" | "title" | "clear", value: string) => string;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

/**
 * TableProvider component provides state management for the CSV table data.
 * Handles loading, filtering, sorting, pagination, and manipulation of table data.
 * Persists state to localStorage for session recovery.
 */
export function TableProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const initialTableData: TableData = {
    data: [],
    columns: [],
    columnTypes: {},
    columnVisibility: {},
    visibleColumns: [],
    filteredRows: [],
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortColumn: null,
    sortDirection: "asc",
    searchQuery: "",
    fileName: "",
    hasData: false,
    isLoading: false,
  };

  const [tableData, setTableData] = useState<TableData>(initialTableData);
  const [editingCell, setEditCell] = useState<CellEdit>({
    rowIndex: null,
    column: null,
    value: null,
  });

  // Computed properties
  const totalRowCount = tableData.data.length;
  const filteredRowCount = tableData.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredRowCount / tableData.pageSize));

  const paginatedRows = tableData.filteredRows.slice(
    (tableData.currentPage - 1) * tableData.pageSize,
    tableData.currentPage * tableData.pageSize,
  );

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const data = normalizeRows(Array.isArray(parsedData?.data) ? parsedData.data : []);
        if (data.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        const columns: string[] =
          Array.isArray(parsedData?.columns) && parsedData.columns.length > 0
            ? parsedData.columns.filter(
                (column: unknown): column is string =>
                  typeof column === "string" && column.trim().length > 0,
              )
            : getColumnsFromRows(data);
        const sortColumn =
          typeof parsedData?.sortColumn === "string" && columns.includes(parsedData.sortColumn)
            ? parsedData.sortColumn
            : null;
        const sortDirection = parsedData?.sortDirection === "desc" ? "desc" : "asc";
        const pageSize =
          typeof parsedData?.pageSize === "number" && PAGE_SIZE_OPTIONS.has(parsedData.pageSize)
            ? parsedData.pageSize
            : DEFAULT_PAGE_SIZE;
        const columnVisibility: Record<string, boolean> = {};
        columns.forEach((column) => {
          columnVisibility[column] =
            parsedData?.columnVisibility?.[column] === false ? false : true;
        });
        const visibleColumns = getVisibleColumns(columns, columnVisibility);
        const columnTypes = detectColumnTypes(data, columns);
        const filteredRows = sortRows(data, sortColumn, sortDirection, columnTypes);

        setTableData((prev) => ({
          ...prev,
          data,
          columns,
          columnTypes,
          columnVisibility,
          visibleColumns: visibleColumns.length > 0 ? visibleColumns : columns,
          filteredRows,
          fileName: typeof parsedData?.fileName === "string" ? parsedData.fileName : "",
          sortColumn,
          sortDirection,
          pageSize,
          hasData: true,
        }));

        toast({
          title: "Data restored",
          description: "Previous session data has been loaded",
        });
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [toast]);

  // Save to localStorage when data changes.
  // TT-01: never let a QuotaExceededError escape into the ErrorBoundary. On
  // quota failure, keep working in memory, drop the stale stored copy and warn
  // once per session.
  const quotaWarnedRef = useRef(false);
  useEffect(() => {
    if (tableData.hasData) {
      const dataToSave = {
        data: tableData.data,
        columns: tableData.columns,
        columnVisibility: tableData.columnVisibility,
        fileName: tableData.fileName,
        sortColumn: tableData.sortColumn,
        sortDirection: tableData.sortDirection,
        pageSize: tableData.pageSize,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        // Remove any stale/partial copy so a later restore does not load it.
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        if (!quotaWarnedRef.current) {
          quotaWarnedRef.current = true;
          toast({
            title: "Too large to keep after reload",
            description:
              "This table is too big for browser storage, so it will not be restored next time. It stays fully usable in this tab.",
            variant: "destructive",
          });
        }
        console.warn("TableTamer: could not persist table to localStorage:", error);
      }
    } else {
      quotaWarnedRef.current = false;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [
    tableData.data,
    tableData.columnVisibility,
    tableData.sortColumn,
    tableData.sortDirection,
    tableData.pageSize,
    tableData.hasData,
    tableData.columns,
    tableData.fileName,
    toast,
  ]);

  // Helper functions
  /**
   * Filters table rows based on search query
   * @param rows Array of data rows to filter
   * @param query Search query string
   * @returns Filtered array of rows that match the query
   */
  const filterRows = (rows: TableRow[], query: string) => {
    if (!query.trim()) {
      return [...rows];
    }

    const lowerQuery = query.toLowerCase().trim();
    return rows.filter((row) => {
      return Object.values(row).some(
        (value) =>
          value !== null && value !== undefined && String(value).toLowerCase().includes(lowerQuery),
      );
    });
  };

  /**
   * Sorts table rows by the specified column using the column's detected type
   * (TT-04). Blank cells always sort last; mixed columns fall back to a
   * locale-aware numeric string compare.
   */
  const sortRows = (
    rows: TableRow[],
    column: string | null,
    direction: "asc" | "desc",
    columnTypes: Record<string, ColumnType>,
  ) => {
    if (!column) return rows;
    const type = columnTypes[column] ?? "string";
    return sortRowsByType(rows, column, direction, type);
  };

  // Main actions
  /**
   * Loads and parses a CSV file
   * @param file The CSV file to load
   * @returns Promise that resolves when the file is loaded and parsed
   */
  const loadCSV = async (file: File): Promise<void> => {
    const lowerName = file?.name?.toLowerCase() ?? "";
    const isCsvFile =
      lowerName.endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";
    if (!file || !isCsvFile) {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }
    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "The selected CSV file is empty",
        variant: "destructive",
      });
      return;
    }

    setTableData((prev) => ({ ...prev, isLoading: true, fileName: file.name }));

    try {
      const result = await new Promise<Papa.ParseResult<TableRow>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false, // TT-02: keep original strings; no silent coercion
          complete: (parseResult) => {
            // TT-03: do not reject on per-row field-count errors. A single
            // ragged row must not throw the whole file away. Only a parse
            // error that leaves no usable data (e.g. an undetectable delimiter)
            // should fail, and that is handled below once we have the rows.
            resolve(parseResult as Papa.ParseResult<TableRow>);
          },
          error: reject,
        });
      });

      const data = normalizeRows(result.data);
      const columns = getColumnsFromRows(data);
      if (data.length === 0 || columns.length === 0) {
        // Nothing usable parsed — surface the first error if PapaParse gave one.
        const firstError = result.errors[0];
        throw new Error(firstError ? firstError.message : "No data found in CSV file");
      }

      // TT-03: count rows that had a different number of fields and warn,
      // without blocking the load.
      const fieldCountErrors = result.errors.filter(
        (e) => e.type === "FieldMismatch",
      );
      const affectedRows = new Set(
        fieldCountErrors.map((e) => e.row).filter((r) => r !== undefined),
      ).size;
      if (affectedRows > 0) {
        toast({
          title: "Some rows had a different number of fields",
          description: `${affectedRows} row${affectedRows === 1 ? "" : "s"} did not match the header. They were loaded anyway — check them.`,
        });
      }

      const columnVisibility = buildColumnVisibility(columns);
      const columnTypes = detectColumnTypes(data, columns);

      setTableData((prev) => {
        const newState: TableData = {
          ...prev,
          data,
          columns,
          columnTypes,
          columnVisibility,
          visibleColumns: columns,
          filteredRows: data,
          currentPage: 1,
          searchQuery: "",
          sortColumn: null,
          sortDirection: "asc",
          hasData: true,
          isLoading: false,
        };
        return newState;
      });

      toast({
        title: "File loaded",
        description: `Successfully loaded ${file.name}`,
      });
    } catch (error) {
      setTableData((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: `Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  /**
   * Loads example data for demo purposes
   * Generates a sample dataset with random values
   * @returns Promise that resolves when example data is generated and loaded
   */
  const loadExampleData = async (): Promise<void> => {
    setTableData((prev) => ({ ...prev, isLoading: true, fileName: "example_data.csv" }));

    // Generate example data
    try {
      const columns = [
        "id",
        "first_name",
        "last_name",
        "email",
        "gender",
        "ip_address",
        "date",
        "amount",
      ];
      const data = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        first_name: ["John", "Jane", "Robert", "Emily", "Michael", "Sarah"][
          Math.floor(Math.random() * 6)
        ],
        last_name: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"][
          Math.floor(Math.random() * 6)
        ],
        email: `example${i + 1}@example.com`,
        gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        date: `${2023 - Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        amount: `$${(Math.random() * 1000).toFixed(2)}`,
      }));

      const columnVisibility = buildColumnVisibility(columns);
      const columnTypes = detectColumnTypes(data, columns);

      setTableData({
        data,
        columns,
        columnTypes,
        columnVisibility,
        visibleColumns: columns,
        filteredRows: data,
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        sortColumn: null,
        sortDirection: "asc",
        searchQuery: "",
        fileName: "example_data.csv",
        hasData: true,
        isLoading: false,
      });

      toast({
        title: "Example data loaded",
        description: "Successfully loaded example data",
      });
    } catch {
      setTableData((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load example data",
        variant: "destructive",
      });
    }
  };

  /**
   * Clears all table data and resets the application state
   * Also removes data from localStorage
   */
  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTableData(initialTableData);
    toast({
      title: "Data cleared",
      description: "All data has been removed",
    });
  };

  const toggleColumnVisibility = (column: string) => {
    // TT-10: decide and toast outside the state updater so StrictMode's double
    // invocation does not fire the toast twice.
    const currentlyVisible = tableData.columnVisibility[column] !== false;
    if (currentlyVisible && tableData.visibleColumns.length <= 1) {
      toast({
        title: "At least one column is required",
        description: "Keep one column visible so the table remains usable.",
        variant: "destructive",
      });
      return;
    }

    setTableData((prev) => {
      const newVisibility = {
        ...prev.columnVisibility,
        [column]: !prev.columnVisibility[column],
      };
      return {
        ...prev,
        columnVisibility: newVisibility,
        visibleColumns: getVisibleColumns(prev.columns, newVisibility),
      };
    });
  };

  const resetColumnVisibility = () => {
    setTableData((prev) => {
      const newVisibility = prev.columns.reduce(
        (acc, column) => {
          acc[column] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      return {
        ...prev,
        columnVisibility: newVisibility,
        visibleColumns: prev.columns,
      };
    });
  };

  const updateSort = (column: string) => {
    setTableData((prev) => {
      const direction =
        prev.sortColumn === column ? (prev.sortDirection === "asc" ? "desc" : "asc") : "asc";

      const filteredRows = sortRows(prev.filteredRows, column, direction, prev.columnTypes);

      return {
        ...prev,
        sortColumn: column,
        sortDirection: direction,
        filteredRows,
      };
    });
  };

  const updateSearch = (query: string) => {
    setTableData((prev) => {
      const filtered = filterRows(prev.data, query);
      const sorted = sortRows(filtered, prev.sortColumn, prev.sortDirection, prev.columnTypes);

      return {
        ...prev,
        searchQuery: query,
        filteredRows: sorted,
        currentPage: 1,
      };
    });
  };

  const updatePageSize = (size: number) => {
    const nextPageSize = PAGE_SIZE_OPTIONS.has(size) ? size : DEFAULT_PAGE_SIZE;
    setTableData((prev) => ({
      ...prev,
      pageSize: nextPageSize,
      currentPage: 1,
    }));
  };

  const updateCurrentPage = (page: number) => {
    setTableData((prev) => ({
      ...prev,
      currentPage: Math.max(
        1,
        Math.min(page, Math.max(1, Math.ceil(prev.filteredRows.length / prev.pageSize))),
      ),
    }));
  };

  const editCell = (rowIndex: number, column: string, value: string) => {
    setTableData((prev) => {
      // Get the actual row index from the filtered data
      const dataIndex = (prev.currentPage - 1) * prev.pageSize + rowIndex;
      const originalRow = prev.filteredRows[dataIndex];
      if (!originalRow) {
        return prev;
      }

      const originalIndex = prev.data.indexOf(originalRow);
      if (originalIndex === -1) {
        return prev;
      }

      const updatedRow = {
        ...originalRow,
        [column]: value,
      };
      const updatedData = [...prev.data];
      updatedData[originalIndex] = updatedRow;

      // TT-08: keep the edited row where it is. Update it in place in the
      // current filtered view instead of re-sorting, so it does not jump away.
      // Re-apply the search filter so an edit that no longer matches drops out,
      // but do not re-sort until the user sorts again.
      let filteredRows: TableRow[];
      if (prev.searchQuery.trim()) {
        filteredRows = filterRows(updatedData, prev.searchQuery);
      } else {
        filteredRows = [...prev.filteredRows];
        filteredRows[dataIndex] = updatedRow;
      }
      const maxPage = Math.max(1, Math.ceil(filteredRows.length / prev.pageSize));

      return {
        ...prev,
        data: updatedData,
        filteredRows,
        currentPage: Math.min(prev.currentPage, maxPage),
      };
    });
  };

  /**
   * Transforms the value of the currently editing cell
   * @param type The type of transformation to apply
   */
  const transformCellValue = (type: "upper" | "lower" | "title" | "clear", value: string) => {
    let newValue = value;

    switch (type) {
      case "upper":
        newValue = value.toUpperCase();
        break;
      case "lower":
        newValue = value.toLowerCase();
        break;
      case "title":
        newValue = value
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        break;
      case "clear":
        newValue = "";
        break;
      default:
        newValue = value;
    }

    return newValue;
  };

  /**
   * Exports the current table data to a file
   * @param format The format to export ("csv" or "json")
   */
  const exportData = (format: "csv" | "json") => {
    if (!tableData.hasData) return;

    try {
      const dataToExport = getExportRows(tableData.filteredRows, tableData.visibleColumns);
      const baseFileName = getBaseFileName(tableData.fileName);
      if (format === "csv") {
        downloadTextFile(
          Papa.unparse(dataToExport, { escapeFormulae: true }),
          `${baseFileName}_export.csv`,
          "text/csv;charset=utf-8;",
        );
      } else {
        downloadTextFile(
          JSON.stringify(dataToExport, null, 2),
          `${baseFileName}_export.json`,
          "application/json;charset=utf-8;",
        );
      }

      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Error exporting data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  /**
   * Copies the current table data to clipboard as JSON
   * Only includes visible columns in the copied data
   */
  const copyToClipboard = async () => {
    if (!tableData.hasData) return;

    try {
      const dataToExport = getExportRows(tableData.filteredRows, tableData.visibleColumns);
      const text = JSON.stringify(dataToExport, null, 2);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast({
        title: "Copied to clipboard",
        description: "Table data copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: `Error copying to clipboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const contextValue: TableContextType = {
    ...tableData,
    loadCSV,
    loadExampleData,
    clearData,
    toggleColumnVisibility,
    resetColumnVisibility,
    updateSort,
    updateSearch,
    updatePageSize,
    updateCurrentPage,
    editCell,
    exportData,
    copyToClipboard,
    totalPages,
    paginatedRows,
    totalRowCount,
    filteredRowCount,
    setEditCell,
    editingCell,
    transformCellValue,
  };

  return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
}

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};
