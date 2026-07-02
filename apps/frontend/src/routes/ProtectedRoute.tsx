import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../store";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
