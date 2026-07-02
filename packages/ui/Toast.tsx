import * as React from "react";
import { cn } from "./utils";
import { X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
}

const ToastContext = React.createContext<{
  toast: (message: Omit<ToastMessage, "id">) => void;
  toasts: ToastMessage[];
  dismiss: (id: string) => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      dismiss(id);
    }, 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all animate-in slide-in-from-bottom-5",
              t.type === "success" &&
                "bg-emerald-500/15 text-emerald-900 border-emerald-500/30 dark:text-emerald-100",
              t.type === "error" &&
                "bg-destructive/15 text-destructive border-destructive/30",
              t.type === "warning" &&
                "bg-amber-500/15 text-amber-900 border-amber-500/30 dark:text-amber-100",
              (!t.type || t.type === "default") &&
                "bg-background text-foreground",
            )}
          >
            <div className="grid gap-1">
              {t.title && (
                <div className="text-sm font-semibold">{t.title}</div>
              )}
              {t.description && (
                <div className="text-sm opacity-90">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
