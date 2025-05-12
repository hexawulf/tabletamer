import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { detectColumnTypes, formatCellValue } from "@/lib/csvUtils";

interface TableDataState {
  data: any[];
  columns: string[];
  columnVisibility: Record<string, boolean>;
  visibleColumns: string[];
  filteredRows: any[];
  currentPage: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  searchQuery: string;
  fileName: string;
  hasData: boolean;
  isLoading: boolean;
  columnTypes: Record<string, string>;
}

interface PaginationInfo {
  totalPages: number;
  paginatedRows: any[];
  totalRowCount: number;
  filteredRowCount: number;
}

interface UseTableDataReturn extends TableDataState, PaginationInfo {
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
  copyToClipboard: () => Promise<void>;
  getFormattedCellValue: (value: any, columnName: string) => string;
}

export function useTableData(): UseTableDataReturn {
  const { toast } = useToast();
  const initialState: TableDataState = {
    data: [],
    columns: [],
    columnVisibility: {},
    visibleColumns: [],
    filteredRows: [],
    currentPage: 1,
    pageSize: 25,
    sortColumn: null,
    sortDirection: "asc",
    searchQuery: "",
    fileName: "",
    hasData: false,
    isLoading: false,
    columnTypes: {},
  };

  const [tableData, setTableData] = useState<TableDataState>(initialState);

  // Computed properties
  const totalRowCount = tableData.data.length;
  const filteredRowCount = tableData.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredRowCount / tableData.pageSize));
  
  const paginatedRows = tableData.filteredRows.slice(
    (tableData.currentPage - 1) * tableData.pageSize,
    tableData.currentPage * tableData.pageSize
  );

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("tableTamerData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        setTableData((prev) => ({
          ...prev,
          data: parsedData.data || [],
          columns: parsedData.columns || [],
          columnVisibility: parsedData.columnVisibility || {},
          visibleColumns: Object.keys(parsedData.columnVisibility || {}).filter(
            (col) => parsedData.columnVisibility[col]
          ),
          fileName: parsedData.fileName || "",
          sortColumn: parsedData.sortColumn || null,
          sortDirection: parsedData.sortDirection || "asc",
          pageSize: parsedData.pageSize || 25,
          columnTypes: parsedData.columnTypes || {},
          hasData: (parsedData.data?.length || 0) > 0,
        }));

        // Apply any sorting and filtering
        setTimeout(() => {
          if (parsedData.data?.length) {
            setTableData((prev) => {
              const filtered = filterRows(parsedData.data, prev.searchQuery);
              const sorted = sortRows(
                filtered,
                prev.sortColumn,
                prev.sortDirection
              );
              return {
                ...prev,
                filteredRows: sorted,
              };
            });
          }
        }, 0);
        
        toast({
          title: "Data restored",
          description: "Previous session data has been loaded",
        });
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage when data changes
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
        columnTypes: tableData.columnTypes,
      };
      localStorage.setItem("tableTamerData", JSON.stringify(dataToSave));
    }
  }, [
    tableData.data, 
    tableData.columnVisibility, 
    tableData.sortColumn, 
    tableData.sortDirection, 
    tableData.pageSize, 
    tableData.hasData,
    tableData.columnTypes
  ]);

  // Helper functions
  const filterRows = useCallback((rows: any[], query: string) => {
    if (!query.trim()) {
      return [...rows];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    return rows.filter((row) => {
      return Object.values(row).some(
        (value) => 
          value !== null && 
          value !== undefined && 
          String(value).toLowerCase().includes(lowerQuery)
      );
    });
  }, []);

  const sortRows = useCallback((rows: any[], column: string | null, direction: "asc" | "desc") => {
    if (!column) return rows;

    return [...rows].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      // Handle null/undefined values
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return direction === "asc" ? -1 : 1;
      if (valueB == null) return direction === "asc" ? 1 : -1;

      // Try to compare as numbers first
      const numA = Number(valueA);
      const numB = Number(valueB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === "asc" ? numA - numB : numB - numA;
      }

      // Special handling for date columns
      if (tableData.columnTypes[column] === 'date') {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return direction === "asc" 
            ? dateA.getTime() - dateB.getTime() 
            : dateB.getTime() - dateA.getTime();
        }
      }

      // Fall back to string comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      return direction === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [tableData.columnTypes]);

  // Main actions
  const loadCSV = async (file: File): Promise<void> => {
    if (!file || !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setTableData((prev) => ({ ...prev, isLoading: true, fileName: file.name }));

    try {
      const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: resolve,
          error: reject,
        });
      });

      if (result.data.length === 0) {
        throw new Error("No data found in CSV file");
      }

      const columns = Object.keys(result.data[0]);
      const columnVisibility = columns.reduce((acc, column) => {
        acc[column] = true;
        return acc;
      }, {} as Record<string, boolean>);

      // Detect column types
      const columnTypes = detectColumnTypes(result.data);

      setTableData((prev) => {
        const newState = {
          ...prev,
          data: result.data,
          columns,
          columnVisibility,
          visibleColumns: columns,
          filteredRows: result.data,
          currentPage: 1,
          columnTypes,
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

  const loadExampleData = async (): Promise<void> => {
    setTableData((prev) => ({ ...prev, isLoading: true, fileName: "example_data.csv" }));

    // Generate example data
    try {
      const columns = ["id", "first_name", "last_name", "email", "gender", "ip_address", "date", "amount"];
      const data = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        first_name: ["John", "Jane", "Robert", "Emily", "Michael", "Sarah"][Math.floor(Math.random() * 6)],
        last_name: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"][Math.floor(Math.random() * 6)],
        email: `example${i + 1}@example.com`,
        gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        date: `${2023 - Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        amount: `$${(Math.random() * 1000).toFixed(2)}`
      }));

      const columnVisibility = columns.reduce((acc, column) => {
        acc[column] = true;
        return acc;
      }, {} as Record<string, boolean>);

      // Detect column types
      const columnTypes = detectColumnTypes(data);

      setTableData({
        data,
        columns,
        columnVisibility,
        visibleColumns: columns,
        filteredRows: data,
        currentPage: 1,
        pageSize: 25,
        sortColumn: null,
        sortDirection: "asc",
        searchQuery: "",
        fileName: "example_data.csv",
        columnTypes,
        hasData: true,
        isLoading: false,
      });

      toast({
        title: "Example data loaded",
        description: "Successfully loaded example data",
      });
    } catch (error) {
      setTableData((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load example data",
        variant: "destructive",
      });
    }
  };

  const clearData = useCallback(() => {
    localStorage.removeItem("tableTamerData");
    setTableData(initialState);
    toast({
      title: "Data cleared",
      description: "All data has been removed",
    });
  }, []);

  const toggleColumnVisibility = useCallback((column: string) => {
    setTableData((prev) => {
      const newVisibility = {
        ...prev.columnVisibility,
        [column]: !prev.columnVisibility[column],
      };
      
      return {
        ...prev,
        columnVisibility: newVisibility,
        visibleColumns: prev.columns.filter((col) => newVisibility[col]),
      };
    });
  }, []);

  const resetColumnVisibility = useCallback(() => {
    setTableData((prev) => {
      const newVisibility = prev.columns.reduce((acc, column) => {
        acc[column] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      return {
        ...prev,
        columnVisibility: newVisibility,
        visibleColumns: prev.columns,
      };
    });
  }, []);

  const updateSort = useCallback((column: string) => {
    setTableData((prev) => {
      const direction = 
        prev.sortColumn === column
          ? prev.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";
      
      const filteredRows = sortRows(
        prev.filteredRows,
        column,
        direction
      );
      
      return {
        ...prev,
        sortColumn: column,
        sortDirection: direction,
        filteredRows,
      };
    });
  }, [sortRows]);

  const updateSearch = useCallback((query: string) => {
    setTableData((prev) => {
      const filtered = filterRows(prev.data, query);
      const sorted = sortRows(filtered, prev.sortColumn, prev.sortDirection);
      
      return {
        ...prev,
        searchQuery: query,
        filteredRows: sorted,
        currentPage: 1,
      };
    });
  }, [filterRows, sortRows]);

  const updatePageSize = useCallback((size: number) => {
    setTableData((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
  }, []);

  const updateCurrentPage = useCallback((page: number) => {
    setTableData((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, Math.ceil(prev.filteredRows.length / prev.pageSize))),
    }));
  }, []);

  const editCell = useCallback((rowIndex: number, column: string, value: string) => {
    setTableData((prev) => {
      // Get the actual row index from the filtered data
      const dataIndex = (prev.currentPage - 1) * prev.pageSize + rowIndex;
      
      // Update the filtered rows
      const updatedFilteredRows = [...prev.filteredRows];
      updatedFilteredRows[dataIndex] = {
        ...updatedFilteredRows[dataIndex],
        [column]: value,
      };
      
      // Find and update the corresponding row in the original data
      const originalRow = prev.filteredRows[dataIndex];
      const originalIndex = prev.data.findIndex(
        (row) => JSON.stringify(row) === JSON.stringify(originalRow)
      );
      
      let updatedData = [...prev.data];
      if (originalIndex !== -1) {
        updatedData[originalIndex] = {
          ...updatedData[originalIndex],
          [column]: value,
        };
      }
      
      return {
        ...prev,
        data: updatedData,
        filteredRows: updatedFilteredRows,
      };
    });
  }, []);

  const exportData = useCallback((format: "csv" | "json") => {
    if (!tableData.hasData) return;
    
    try {
      let content: string;
      let fileName: string;
      let mimeType: string;
      
      // Filter only visible columns
      const dataToExport = tableData.filteredRows.map((row) => {
        const filtered: Record<string, any> = {};
        tableData.visibleColumns.forEach((col) => {
          filtered[col] = row[col];
        });
        return filtered;
      });
      
      if (format === "csv") {
        content = Papa.unparse(dataToExport);
        fileName = `${tableData.fileName.replace(".csv", "")}_export.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        content = JSON.stringify(dataToExport, null, 2);
        fileName = `${tableData.fileName.replace(".csv", "")}_export.json`;
        mimeType = "application/json;charset=utf-8;";
      }
      
      // Create a download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
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
  }, [tableData.hasData, tableData.filteredRows, tableData.visibleColumns, tableData.fileName]);

  const copyToClipboard = useCallback(async () => {
    if (!tableData.hasData) return;
    
    try {
      // Extract only visible columns
      const dataToExport = tableData.filteredRows.map((row) => {
        const filtered: Record<string, any> = {};
        tableData.visibleColumns.forEach((col) => {
          filtered[col] = row[col];
        });
        return filtered;
      });
      
      const text = JSON.stringify(dataToExport, null, 2);
      await navigator.clipboard.writeText(text);
      
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
  }, [tableData.hasData, tableData.filteredRows, tableData.visibleColumns]);

  const getFormattedCellValue = useCallback((value: any, columnName: string): string => {
    if (value === null || value === undefined) return "";
    
    const columnType = tableData.columnTypes[columnName] || 'string';
    return formatCellValue(value, columnType);
  }, [tableData.columnTypes]);

  return {
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
    getFormattedCellValue,
  };
}
