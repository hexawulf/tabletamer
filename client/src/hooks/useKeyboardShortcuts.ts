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
  const { hasData, updateCurrentPage, currentPage, totalPages, exportData, updateSearch } =
    useTableContext();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      return (
        target.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select"
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcutKey = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const typingTarget = isTypingTarget(event.target);

      // Only handle shortcuts if data is loaded (except for keyboard shortcut dialog)
      if (!hasData && !(shortcutKey && key === "k")) return;

      // Ctrl + F for search
      if (shortcutKey && key === "f") {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search data..."]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      if (typingTarget) {
        return;
      }

      // Ctrl + M for column manager
      if (shortcutKey && key === "m") {
        event.preventDefault();
        onShowColumnManager();
        return;
      }

      // Ctrl + E for export
      if (shortcutKey && key === "e") {
        event.preventDefault();
        exportData("csv");
        return;
      }

      // Ctrl + D for dark mode toggle
      if (shortcutKey && key === "d") {
        event.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }

      // Ctrl + K for keyboard shortcuts
      if (shortcutKey && key === "k") {
        event.preventDefault();
        onShowKeyboardShortcuts();
        return;
      }

      // Arrow keys for pagination
      if (event.key === "ArrowRight" && currentPage < totalPages) {
        updateCurrentPage(currentPage + 1);
      }

      if (event.key === "ArrowLeft" && currentPage > 1) {
        updateCurrentPage(currentPage - 1);
      }

      // Escape to clear filters
      if (key === "escape" && hasData) {
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
