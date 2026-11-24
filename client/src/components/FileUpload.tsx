import { useState, useRef } from "react";
import { CloudUploadIcon, PlayCircleIcon } from "lucide-react";
import { useTableContext } from "@/context/TableContext";

export function FileUpload() {
  const { loadCSV, loadExampleData } = useTableContext();
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      loadCSV(files[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      loadCSV(files[0]);
    }
    event.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10 sm:py-12">
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to TableTamer</h2>
        <p className="text-muted-foreground">
          Import your CSV file to get started. Drag and drop or click below to upload.
        </p>
      </div>

      {/* File drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-10 sm:p-12 text-center bg-card shadow-xs transition duration-150 cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isHovering
            ? "border-teal-500 bg-teal-50/70 dark:bg-teal-950/30"
            : "border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsHovering(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsHovering(false);
        }}
        onDrop={handleFileDrop}
        onClick={triggerFileInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerFileInput();
          }
        }}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <CloudUploadIcon className="h-14 w-14 text-slate-400 group-hover:text-teal-600 dark:text-slate-500 dark:group-hover:text-teal-400 transition duration-150" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-teal-700 dark:text-teal-400">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CSV files only · processed locally in your browser
            </p>
          </div>
        </div>
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileSelect}
        />
      </div>

      {/* Example data option */}
      <div className="text-center">
        <button
          type="button"
          className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 underline-offset-4 hover:underline transition-colors"
          onClick={() => loadExampleData()}
        >
          <PlayCircleIcon className="mr-1.5 h-4 w-4" /> Or try with example data
        </button>
      </div>
    </div>
  );
}
