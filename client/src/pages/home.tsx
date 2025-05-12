import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUpload } from "@/components/FileUpload";
import { TableView } from "@/components/TableView";
import { useTableContext } from "@/context/TableContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ColumnManager } from "@/components/ColumnManager";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Squircle } from "lucide-react";

export default function Home() {
  const { hasData, isLoading } = useTableContext();
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useKeyboardShortcuts({
    onShowColumnManager: () => setShowColumnManager(true),
    onShowKeyboardShortcuts: () => setShowKeyboardShortcuts(true),
  });

  // The root div needs to be a flex container with min-h-screen to allow footer to stick at bottom
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative overflow-y-auto focus:outline-none">
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin">
                  <Squircle className="h-12 w-12 text-primary" />
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Processing your file...
                </p>
              </div>
            </div>
          ) : !hasData ? (
            <FileUpload />
          ) : (
            <TableView />
          )}
        </div>
      </main>
      
      <Footer />

      {showColumnManager && (
        <ColumnManager onClose={() => setShowColumnManager(false)} />
      )}
      
      {showKeyboardShortcuts && (
        <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </div>
  );
}
