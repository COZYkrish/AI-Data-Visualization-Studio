import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "../store";
import { useAuthHooks } from "../features/auth/hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const { useCurrentUser } = useAuthHooks();
  const location = useLocation();

  // This query will only run if isAuthenticated is true
  const { isLoading } = useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // You might want to show a loading state while fetching the current user
  // This prevents flickering if the token is valid but we're still fetching user details
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If there's an error (e.g., token expired or invalid), the interceptor will handle the silent refresh.
  // If the refresh fails, it will call setSessionExpired which sets isAuthenticated to false,
  // triggering the redirect to login above.

  return <Outlet />;
};
