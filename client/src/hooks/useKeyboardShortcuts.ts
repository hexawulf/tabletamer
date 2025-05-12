import { useEffect } from "react";
import { useTableContext } from "@/context/TableContext";
import { useTheme } from "@/components/ui/theme-provider";

interface UseKeyboardShortcutsProps {
  onShowColumnManager: () => void;
  onShowKeyboardShortcuts: () => void;
}

export function useKeyboardShortcuts({
  onShowColumnManager,
  onShowKeyboardShortcuts,
}: UseKeyboardShortcutsProps) {
  const {
    hasData,
    updateCurrentPage,
    currentPage,
    totalPages,
    exportData,
    updateSearch,
  } = useTableContext();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if data is loaded (except for keyboard shortcut dialog)
      if (!hasData && !(event.ctrlKey && event.key === "k")) return;

      // Ctrl + F for search
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search data..."]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl + M for column manager
      if (event.ctrlKey && event.key === "m") {
        event.preventDefault();
        onShowColumnManager();
      }

      // Ctrl + E for export
      if (event.ctrlKey && event.key === "e") {
        event.preventDefault();
        exportData("csv");
      }

      // Ctrl + D for dark mode toggle
      if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
      }

      // Ctrl + K for keyboard shortcuts
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        onShowKeyboardShortcuts();
      }

      // Arrow keys for pagination
      if (event.key === "ArrowRight" && currentPage < totalPages) {
        updateCurrentPage(currentPage + 1);
      }

      if (event.key === "ArrowLeft" && currentPage > 1) {
        updateCurrentPage(currentPage - 1);
      }

      // Escape to clear filters
      if (event.key === "Escape" && hasData) {
        updateSearch("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    hasData,
    currentPage,
    totalPages,
    theme,
    updateCurrentPage,
    exportData,
    updateSearch,
    setTheme,
    onShowColumnManager,
    onShowKeyboardShortcuts,
  ]);
}
