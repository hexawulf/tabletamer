# TableTamer

A browser-based CSV visualization and transformation tool that converts raw CSV data into beautiful, interactive tables.

## Features

- **File Import**
  - Drag-and-drop CSV file upload zone
  - Traditional file input as fallback
  - Loading indicators during processing
  - Support for large files with graceful handling

- **Interactive Table Display**
  - Responsive table with fixed headers
  - Pagination with configurable page size (10, 25, 50, 100 rows)
  - Column sorting (single column, ascending/descending)
  - Column resizing via drag handles
  - Cell value detection and formatting
  - Inline cell editing

- **Data Manipulation**
  - Global search across all columns
  - Column visibility toggle
  - Text case transformations (uppercase, lowercase, title case)
  - Cell value editing

- **Export Options**
  - Export to CSV with proper formatting
  - Export to JSON with formatting options
  - Copy to clipboard functionality
  - Options to export filtered/visible data

- **User Experience**
  - Light/dark mode toggle with system preference detection
  - Clean, intuitive UI with proper spacing
  - Helpful tooltips and empty states
  - Keyboard shortcuts for common actions
  - State persistence via localStorage

## Technology Stack

- **Framework**: React 18 with functional components and hooks
- **Styling**: TailwindCSS with shadcn/ui components
- **Table**: Custom table implementation with advanced features
- **CSV Parsing**: PapaParse for robust CSV handling
- **File Export**: FileSaver.js for downloading transformed data
- **State Management**: React Context API for application state
- **Bundler**: Vite for fast development and optimized production builds

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl + F |
| Column Manager | Ctrl + M |
| Next Page | → |
| Previous Page | ← |
| Export as CSV | Ctrl + E |
| Toggle Theme | Ctrl + D |
| Show Keyboard Shortcuts | Ctrl + K |

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser to the URL shown in the terminal (typically http://localhost:5000)

## Future Enhancements

- Column reordering via drag-and-drop
- Advanced filtering options for specific column types
- Summary statistics for numeric columns
- Basic data visualization (histograms, bar charts)
- Data transformation history with undo/redo
- Import from different file formats (Excel, JSON)
- Custom column type definitions
- Collaborative editing via WebSockets
- User-defined templates and presets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

- Author: 0xWulf
- Email: dev@0xwulf.dev

## License

This project is licensed under the MIT License - see the LICENSE file for details.