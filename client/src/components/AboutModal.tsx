import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>About TableTamer</DialogTitle>
          <DialogDescription>
            A browser-based CSV visualization and transformation tool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary">TableTamer v1.1.0</h2>
            <p className="text-sm text-muted-foreground">Released: November 2026</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-lg">Overview</h3>
          <p>
            TableTamer is a browser-based CSV visualization and transformation tool that converts
            raw CSV data into beautiful, interactive tables. The application primarily runs in the
            browser, with a lightweight server wrapper for delivery.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-lg">Key Features</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Drag-and-drop CSV file upload</li>
            <li>Interactive table with sorting, filtering, and pagination</li>
            <li>Column visibility management</li>
            <li>Cell editing with text transformations</li>
            <li>Export to CSV and JSON formats</li>
            <li>Light/dark theme support</li>
            <li>Keyboard shortcuts for power users</li>
            <li>Local storage persistence (the table stays usable if storage is full)</li>
            <li>Values kept exactly as typed (leading zeros, long IDs) and type-aware sorting</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-lg">Technology</h3>
          <p className="text-sm">
            Built with React, TailwindCSS, Radix UI, PapaParse, and an Express server with Helmet.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-lg">What&apos;s new in 1.1.0</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Large CSVs no longer crash the app when browser storage is full</li>
            <li>CSV values are no longer changed on load; export round-trips unchanged</li>
            <li>Rows with a different number of fields load with a warning</li>
            <li>Type-aware, stable sorting with empty cells last</li>
            <li>Exported CSVs are protected against spreadsheet formula injection</li>
            <li>Keyboard shortcuts no longer clash with browser shortcuts</li>
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <h3 className="font-medium text-sm">Contact</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Author: 0xWulf</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email:{" "}
            <a href="mailto:dev@0xwulf.dev" className="text-blue-600 hover:underline">
              dev@0xwulf.dev
            </a>
          </p>
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
