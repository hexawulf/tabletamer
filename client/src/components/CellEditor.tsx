import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTableContext } from "@/context/TableContext";

interface CellEditorProps {
  onClose: () => void;
}

export function CellEditor({ onClose }: CellEditorProps) {
  const { editingCell, editCell, transformCellValue } = useTableContext();
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    if (editingCell.value !== null) {
      setLocalValue(editingCell.value);
    }
  }, [editingCell]);

  const handleSave = () => {
    if (
      editingCell.rowIndex !== null &&
      editingCell.column !== null &&
      editingCell.value !== null
    ) {
      editCell(editingCell.rowIndex, editingCell.column, localValue);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {editingCell.column}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            rows={3}
            className="w-full resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                transformCellValue("upper");
                setLocalValue(editingCell.value || "");
              }}
            >
              UPPERCASE
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                transformCellValue("lower");
                setLocalValue(editingCell.value || "");
              }}
            >
              lowercase
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                transformCellValue("title");
                setLocalValue(editingCell.value || "");
              }}
            >
              Title Case
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLocalValue("")}
            >
              Clear
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
