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
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to TableTamer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Import your CSV file to get started. Drag and drop or click below to
          upload.
        </p>
      </div>

      {/* File drop zone */}
      <div
        className={`w-full max-w-lg border-2 border-dashed rounded-lg p-12 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150 cursor-pointer group ${
          isHovering
            ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-700"
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
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <CloudUploadIcon className="h-16 w-16 text-gray-400 group-hover:text-primary-500 dark:text-gray-500 dark:group-hover:text-primary-400 transition duration-150" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              CSV files only
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
      <div className="mt-4 text-center">
        <button
          type="button"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          onClick={() => loadExampleData()}
        >
          <PlayCircleIcon className="mr-1 h-4 w-4" /> Or try with example data
        </button>
      </div>
    </div>
  );
}
