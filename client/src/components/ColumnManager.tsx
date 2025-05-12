import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical } from "lucide-react";
import { useTableContext } from "@/context/TableContext";

interface ColumnManagerProps {
  onClose: () => void;
}

export function ColumnManager({ onClose }: ColumnManagerProps) {
  const { columns, columnVisibility, toggleColumnVisibility, resetColumnVisibility } = useTableContext();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select which columns to display. Drag and drop to reorder.
          </p>

          <div className="mt-4 max-h-96 overflow-y-auto">
            <ul className="space-y-2">
              {columns.map((column, index) => (
                <li
                  key={column}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={`column-${index}`}
                      checked={columnVisibility[column]}
                      onCheckedChange={() => toggleColumnVisibility(column)}
                    />
                    <label
                      htmlFor={`column-${index}`}
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate"
                    >
                      {column}
                    </label>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <GripVertical className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => resetColumnVisibility()}>
            Reset
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
