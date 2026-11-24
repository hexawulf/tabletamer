import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTableContext } from "@/context/TableContext";

interface ColumnManagerProps {
  onClose: () => void;
}

export function ColumnManager({ onClose }: ColumnManagerProps) {
  const { columns, columnVisibility, toggleColumnVisibility, resetColumnVisibility } =
    useTableContext();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        <div className="mt-1">
          <p className="text-sm text-muted-foreground">
            Select which columns to display in the table.
          </p>

          <div className="mt-3 max-h-80 overflow-y-auto">
            <ul className="space-y-1.5">
              {columns.map((column, index) => (
                <li
                  key={column}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-muted/40"
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={`column-${index}`}
                      checked={columnVisibility[column]}
                      onCheckedChange={() => toggleColumnVisibility(column)}
                    />
                    <label
                      htmlFor={`column-${index}`}
                      className="ml-3 block text-sm font-medium text-foreground max-w-xs truncate cursor-pointer"
                    >
                      {column}
                    </label>
                  </div>
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
