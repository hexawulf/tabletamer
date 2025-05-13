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
      <footer className="bg-white dark:bg-gray-800 shadow-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="mb-2 sm:mb-0">
              {fileName ? (
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Current file: {fileName}
                </span>
              ) : (
                <span>No file loaded</span>
              )}
            </div>
            <div className="flex flex-wrap space-x-4">
              <button
                className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
                onClick={() => setShowKeyboardShortcuts(true)}
              >
                Keyboard Shortcuts
              </button>
              <span>|</span>
              <button 
                className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
                onClick={() => setShowAbout(true)}
              >
                <InfoIcon className="h-3.5 w-3.5 mr-1" />
                About
              </button>
              <span>|</span>
              <span>TableTamer v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      {showKeyboardShortcuts && (
        <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
      )}
      
      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
    </>
  );
}
