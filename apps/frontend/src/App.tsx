import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import { ToastProvider } from "@studio/ui";
import { router } from "./routes";

// Initialize TanStack Query Client for REST hooks caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
