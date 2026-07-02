import * as React from "react";
import { Outlet, Link } from "react-router-dom";
import { Database } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <Database className="h-10 w-10 text-primary animate-bounce" />
            <span className="font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 font-sans">
              Studio.ai
            </span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground font-sans">
            AI Data Visualization Studio
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enterprise Grade Data Analytics
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;
