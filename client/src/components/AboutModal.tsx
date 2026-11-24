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
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="TableTamer"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg shrink-0"
            />
            <div className="text-left">
              <DialogTitle className="text-lg">About TableTamer</DialogTitle>
              <DialogDescription>Browser-based CSV viewer, editor, and exporter</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-baseline justify-between rounded-md border border-border bg-muted/50 px-3.5 py-2.5">
            <div>
              <h2 className="text-base font-bold text-teal-700 dark:text-teal-400">
                TableTamer v{__APP_VERSION__}
              </h2>
              <p className="text-xs text-muted-foreground">Released: November 2026</p>
            </div>
            <a
              href="https://github.com/hexawulf/tabletamer"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
            >
              GitHub Repository
            </a>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            TableTamer parses and edits CSV files locally in your browser with PapaParse — nothing
            is uploaded, and there are no accounts or databases.
          </p>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-muted-foreground">
              <li>Drag-and-drop CSV upload</li>
              <li>Type-aware, stable sorting</li>
              <li>Cross-column search &amp; pagination</li>
              <li>Column visibility &amp; resizing</li>
              <li>Inline editing &amp; case transforms</li>
              <li>Formula-safe CSV &amp; JSON export</li>
              <li>No silent value coercion</li>
              <li>Light &amp; dark themes + shortcuts</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Technology</h3>
            <p className="text-muted-foreground">
              React 18, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, PapaParse, and Express 5 with
              Helmet.
            </p>
          </div>

          <div className="pt-3 border-t border-border text-center text-muted-foreground">
            <strong className="text-foreground">Developer:</strong> Erling Wulf Weinreich (0xWulf) ·{" "}
            <a
              href="mailto:dev@0xwulf.dev"
              className="text-teal-700 dark:text-teal-400 font-medium hover:underline"
            >
              dev@0xwulf.dev
            </a>
          </div>
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
