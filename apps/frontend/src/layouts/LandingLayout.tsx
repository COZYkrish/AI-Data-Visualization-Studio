import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@studio/ui";
import { useThemeStore } from "../store";
import { Sun, Moon, Database, ChevronRight } from "lucide-react";

export const LandingLayout: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 font-sans">
              Studio.ai
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 group">
                Get Started
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-10 bg-card text-card-foreground">
        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary/70" />
            <span className="font-semibold text-foreground">Studio.ai</span>
            <span>
              &copy; {new Date().getFullYear()} AI Data Visualization Studio.
              All rights reserved.
            </span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Status
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingLayout;
