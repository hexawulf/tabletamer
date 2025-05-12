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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

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
          
          setColumnWidths(prev => ({
            ...prev,
            [resizingColumn]: newWidth
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
    setEditCell({
      rowIndex,
      column,
      value: row[column] !== null && row[column] !== undefined ? String(row[column]) : "",
    });
    setShowCellEdit(true);
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search data..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {filteredRowCount} of {totalRowCount} rows
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnManager(true)}
          >
            <Rows3 className="h-4 w-4 mr-2" />
            Columns
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportData("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard()}>
                Copy to clipboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={clearData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New File
          </Button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
              <tr>
                {visibleColumns.map((column, columnIndex) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer group"
                    style={{ width: columnWidths[columnIndex] ? `${columnWidths[columnIndex]}px` : undefined, position: 'relative' }}
                    onClick={() => updateSort(column)}
                  >
                    <div className="flex items-center relative">
                      <span 
                        className="max-w-xs truncate" 
                        title={column}
                      >
                        {column}
                      </span>

                      {/* Sort indicators */}
                      <span className="ml-2 flex-none">
                        <ArrowUp
                          className={`h-3 w-3 transition-opacity ${
                            sortColumn === column && sortDirection === "asc"
                              ? "opacity-100 text-primary-500"
                              : "opacity-0 group-hover:opacity-50 text-gray-400"
                          }`}
                        />
                        <ArrowDown
                          className={`h-3 w-3 -mt-1 transition-opacity ${
                            sortColumn === column && sortDirection === "desc"
                              ? "opacity-100 text-primary-500"
                              : "opacity-0 group-hover:opacity-50 text-gray-400"
                          }`}
                        />
                      </span>

                      {/* Resizer handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-400 dark:bg-gray-600 opacity-0 group-hover:opacity-50 hover:opacity-100"
                        onMouseDown={(e) => startResizing(e, columnIndex)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleCellEdit(rowIndex, column)}
                      >
                        <span
                          className={!row[column] ? "text-gray-400 dark:text-gray-500 italic" : ""}
                        >
                          {row[column] !== null && row[column] !== undefined
                            ? row[column]
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
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center">
                      <FileSearch className="h-12 w-12 mb-3" />
                      <p>No matching records found</p>
                      <Button
                        variant="link"
                        className="mt-2 text-primary-600 dark:text-primary-400 text-sm"
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
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => updateCurrentPage(currentPage - 1)}
              className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => updateCurrentPage(currentPage + 1)}
              className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredRowCount)}
                </span>{" "}
                of <span className="font-medium">{filteredRowCount}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Rows per page:
              </span>
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

              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-md"
                  disabled={currentPage === 1}
                  onClick={() => updateCurrentPage(1)}
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
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
                    className="hidden sm:inline-flex"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => updateCurrentPage(currentPage + 1)}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-md"
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
      {showColumnManager && (
        <ColumnManager onClose={() => setShowColumnManager(false)} />
      )}
      {showCellEdit && <CellEditor onClose={() => setShowCellEdit(false)} />}
    </div>
  );
}
