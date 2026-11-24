import { Sun, Moon } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="bg-card shadow-xs border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/favicon.svg"
            alt="TableTamer"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg shrink-0"
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground">TableTamer</h1>
          <span className="px-2.5 py-0.5 text-xs rounded-full bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800/80 font-medium">
            CSV Tool
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://github.com/hexawulf/tabletamer"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Button variant="ghost" size="icon" aria-label="View on GitHub">
                  <GithubIcon className="h-5 w-5" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>View on GitHub</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
