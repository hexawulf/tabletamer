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
    { action: "Focus search", keys: ["Ctrl", "F"] },
    { action: "Column Manager", keys: ["Ctrl", "M"] },
    { action: "Shortcuts dialog", keys: ["Ctrl", "K"] },
    { action: "Export as CSV", keys: ["Alt", "Shift", "E"] },
    { action: "Toggle Theme", keys: ["Alt", "Shift", "D"] },
    { action: "Next Page", keys: ["→"] },
    { action: "Previous Page", keys: ["←"] },
    { action: "Clear search", keys: ["Esc"] },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          {shortcuts.map((shortcut, index) => (
            <div
              key={shortcut.action}
              className={`flex justify-between items-center py-1.5 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="text-foreground">{shortcut.action}</span>
              <span className="flex space-x-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 text-xs font-mono bg-muted text-foreground border border-border rounded"
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
