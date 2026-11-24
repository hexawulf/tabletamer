import { useRef, useState, useEffect } from "react";
import {
  Search,
  Rows3,
  Download,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  FileSearch,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTableContext } from "@/context/TableContext";
import { ColumnManager } from "./ColumnManager";
import { CellEditor } from "./CellEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TableView() {
  const {
    paginatedRows,
    visibleColumns,
    updateSort,
    sortColumn,
    sortDirection,
    updateSearch,
    searchQuery,
    totalRowCount,
    filteredRowCount,
    currentPage,
    pageSize,
    updatePageSize,
    updateCurrentPage,
    totalPages,
    clearData,
    exportData,
    copyToClipboard,
    setEditCell,
  } = useTableContext();

  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showCellEdit, setShowCellEdit] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  // Calculate page numbers for pagination
  const pageNumbers = (() => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  })();

  // Handle column resizing
  const startResizing = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizingColumn(columnIndex);
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isResizing && resizingColumn !== null && tableRef.current) {
        const headerCells = tableRef.current.querySelectorAll("th");
        if (headerCells[resizingColumn]) {
          const headerRect = headerCells[resizingColumn].getBoundingClientRect();
          const newWidth = Math.max(100, e.clientX - headerRect.left);

          setColumnWidths((prev) => ({
            ...prev,
            [resizingColumn]: newWidth,
          }));
        }
      }
    };

    const stopResizing = () => {
      setIsResizing(false);
      setResizingColumn(null);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resizingColumn]);

  // Edit cell
  const handleCellEdit = (rowIndex: number, column: string) => {
    const row = paginatedRows[rowIndex];
    if (!row) {
      return;
    }
    setEditCell({
      rowIndex,
      column,
      value: row[column] !== null && row[column] !== undefined ? String(row[column]) : "",
    });
    setShowCellEdit(true);
  };

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="bg-card border border-border rounded-lg shadow-xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="relative rounded-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="table-search-input"
              type="text"
              placeholder="Search data..."
              className="pl-9 h-9 bg-background"
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredRowCount} of {totalRowCount} rows
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowColumnManager(true)}>
            <Rows3 className="h-4 w-4" />
            Columns
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => exportData("csv")}
                title="Cells starting with = + - @ are prefixed so spreadsheets do not run them as formulas."
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("json")}>Export as JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard()}>
                Copy to clipboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={clearData}>
            <RefreshCw className="h-4 w-4" />
            New File
          </Button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50 dark:bg-slate-950/70 sticky top-0">
              <tr>
                {visibleColumns.map((column, columnIndex) => {
                  const isSorted = sortColumn === column;
                  return (
                    <th
                      key={column}
                      className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none group transition-colors ${
                        isSorted
                          ? "text-teal-800 dark:text-teal-300"
                          : "text-slate-600 dark:text-slate-300 hover:text-foreground"
                      }`}
                      style={{
                        width: columnWidths[columnIndex]
                          ? `${columnWidths[columnIndex]}px`
                          : undefined,
                        position: "relative",
                      }}
                      onClick={() => updateSort(column)}
                      aria-sort={
                        !isSorted ? "none" : sortDirection === "asc" ? "ascending" : "descending"
                      }
                    >
                      <div className="flex items-center relative">
                        <span className="max-w-xs truncate" title={column}>
                          {column}
                        </span>

                        {/* Sort indicators */}
                        <span className="ml-1.5 flex-none">
                          <ArrowUp
                            className={`h-3 w-3 transition-opacity ${
                              isSorted && sortDirection === "asc"
                                ? "opacity-100 text-teal-700 dark:text-teal-400"
                                : "opacity-0 group-hover:opacity-50 text-muted-foreground"
                            }`}
                          />
                          <ArrowDown
                            className={`h-3 w-3 -mt-1 transition-opacity ${
                              isSorted && sortDirection === "desc"
                                ? "opacity-100 text-teal-700 dark:text-teal-400"
                                : "opacity-0 group-hover:opacity-50 text-muted-foreground"
                            }`}
                          />
                        </span>

                        {/* Resizer handle */}
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-slate-400 dark:bg-slate-600 hover:bg-teal-500 opacity-0 group-hover:opacity-60 hover:opacity-100"
                          onMouseDown={(e) => startResizing(e, columnIndex)}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-teal-50/50 dark:hover:bg-teal-950/25 transition-colors"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-2.5 whitespace-nowrap text-sm font-mono text-slate-800 dark:text-slate-200 cursor-pointer"
                        onClick={() => handleCellEdit(rowIndex, column)}
                      >
                        <span
                          className={
                            !row[column] ? "text-slate-400 dark:text-slate-500 italic" : ""
                          }
                        >
                          {row[column] !== null && row[column] !== undefined
                            ? String(row[column])
                            : ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <FileSearch className="h-12 w-12 mb-3 text-slate-400 dark:text-slate-500" />
                      <p>No matching records found</p>
                      <Button
                        variant="link"
                        className="mt-2 text-teal-700 dark:text-teal-400 text-sm"
                        onClick={() => updateSearch("")}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-card px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
          <div className="flex-1 flex items-center justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => updateCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => updateCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredRowCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * pageSize, filteredRowCount)}
                </span>{" "}
                of <span className="font-medium text-foreground">{filteredRowCount}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => updatePageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <nav
                className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  disabled={currentPage === 1}
                  onClick={() => updateCurrentPage(1)}
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  disabled={currentPage === 1}
                  onClick={() => updateCurrentPage(currentPage - 1)}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => updateCurrentPage(page)}
                    className="hidden sm:inline-flex h-8 min-w-8 px-2.5 rounded-none"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  disabled={currentPage === totalPages}
                  onClick={() => updateCurrentPage(currentPage + 1)}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  disabled={currentPage === totalPages}
                  onClick={() => updateCurrentPage(totalPages)}
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showColumnManager && <ColumnManager onClose={() => setShowColumnManager(false)} />}
      {showCellEdit && <CellEditor onClose={() => setShowCellEdit(false)} />}
    </div>
  );
}
