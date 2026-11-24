import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = (): void => {
    localStorage.removeItem("tableTamerData");
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border shadow-lg rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-14 w-14 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred in the application."}
            </p>
            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Reset Application
              </Button>
              <p className="text-sm text-muted-foreground">
                This will clear all data and restart the application.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
