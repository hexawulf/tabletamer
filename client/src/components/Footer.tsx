import { useState } from "react";
import { useTableContext } from "@/context/TableContext";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { AboutModal } from "./AboutModal";
import { InfoIcon } from "lucide-react";

/**
 * Footer component displays the application footer including:
 * - Current file being edited
 * - Links to keyboard shortcuts
 * - Link to about information
 * - Application version
 */
export function Footer() {
  const { fileName } = useTableContext();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <footer className="bg-card shadow-xs border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-2 sm:mb-0">
              {fileName ? (
                <span className="font-medium text-foreground">Current file: {fileName}</span>
              ) : (
                <span>No file loaded</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <button
                type="button"
                className="text-muted-foreground hover:text-teal-700 dark:hover:text-teal-400 transition-colors flex items-center"
                onClick={() => setShowKeyboardShortcuts(true)}
              >
                Keyboard Shortcuts
              </button>
              <span aria-hidden="true" className="text-border">
                |
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-teal-700 dark:hover:text-teal-400 transition-colors flex items-center"
                onClick={() => setShowAbout(true)}
              >
                <InfoIcon className="h-3.5 w-3.5 mr-1" />
                About
              </button>
              <span aria-hidden="true" className="text-border">
                |
              </span>
              <span>TableTamer v{__APP_VERSION__}</span>
            </div>
          </div>
        </div>
      </footer>

      {showKeyboardShortcuts && (
        <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
