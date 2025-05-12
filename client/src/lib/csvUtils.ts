import Papa from "papaparse";
import FileSaver from "file-saver";

// Parse CSV file to array of objects
export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(results.errors[0].message);
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error.message);
      },
    });
  });
}

// Convert array of objects to CSV and download
export function exportToCSV(data: any[], fileName: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  FileSaver.saveAs(blob, fileName);
}

// Convert array of objects to JSON and download
export function exportToJSON(data: any[], fileName: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  FileSaver.saveAs(blob, fileName);
}

// Detect column types from data
export function detectColumnTypes(data: any[]): Record<string, string> {
  if (data.length === 0) return {};

  const columnTypes: Record<string, string> = {};
  const sampleSize = Math.min(data.length, 100);
  const sample = data.slice(0, sampleSize);

  // Get all column names
  const columns = Object.keys(data[0]);

  columns.forEach((column) => {
    const values = sample.map((row) => row[column]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "");

    if (nonNullValues.length === 0) {
      columnTypes[column] = "unknown";
      return;
    }

    // Check if all values are numbers
    const allNumbers = nonNullValues.every((v) => !isNaN(Number(v)));
    if (allNumbers) {
      // Check if all numbers are integers
      const allIntegers = nonNullValues.every((v) => Number.isInteger(Number(v)));
      columnTypes[column] = allIntegers ? "integer" : "decimal";
      return;
    }

    // Check for dates (simple check for common formats)
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/;
    const allDates = nonNullValues.every((v) => datePattern.test(String(v)));
    if (allDates) {
      columnTypes[column] = "date";
      return;
    }

    // Check for boolean values
    const booleanValues = ["true", "false", "0", "1", "yes", "no"];
    const allBooleans = nonNullValues.every((v) =>
      booleanValues.includes(String(v).toLowerCase())
    );
    if (allBooleans) {
      columnTypes[column] = "boolean";
      return;
    }

    // Default to string
    columnTypes[column] = "string";
  });

  return columnTypes;
}

// Format cell values based on column type
export function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return "";

  switch (type) {
    case "decimal":
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "integer":
      return Number(value).toLocaleString();
    case "date":
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch (e) {
        return String(value);
      }
    case "boolean":
      return value === true || value === 1 || value === "true" || value === "yes"
        ? "Yes"
        : "No";
    default:
      return String(value);
  }
}
