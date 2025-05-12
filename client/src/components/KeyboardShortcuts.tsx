import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    { action: "Search", keys: ["Ctrl", "F"] },
    { action: "Column Manager", keys: ["Ctrl", "M"] },
    { action: "Next Page", keys: ["→"] },
    { action: "Previous Page", keys: ["←"] },
    { action: "Export as CSV", keys: ["Ctrl", "E"] },
    { action: "Toggle Theme", keys: ["Ctrl", "D"] },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          {shortcuts.map((shortcut, index) => (
            <div
              key={shortcut.action}
              className={`flex justify-between items-center py-1 ${
                index > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
              }`}
            >
              <span>{shortcut.action}</span>
              <span className="flex space-x-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
