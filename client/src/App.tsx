import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { TableProvider } from "@/context/TableContext";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Router component to handle application routing
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main application component that sets up the provider hierarchy
 * and global application state
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="table-tamer-theme">
        <TooltipProvider>
          <TableProvider>
            <Toaster />
            <Router />
          </TableProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
