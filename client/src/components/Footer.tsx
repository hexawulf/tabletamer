import { useState } from "react";
import { useTableContext } from "@/context/TableContext";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

export function Footer() {
  const { fileName } = useTableContext();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

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
            <div className="flex space-x-4">
              <button
                className="hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setShowKeyboardShortcuts(true)}
              >
                Keyboard Shortcuts
              </button>
              <span>|</span>
              <span>TableTamer v1.0</span>
            </div>
          </div>
        </div>
      </footer>

      {showKeyboardShortcuts && (
        <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </>
  );
}
