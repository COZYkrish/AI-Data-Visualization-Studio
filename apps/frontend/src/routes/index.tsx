import { createBrowserRouter } from "react-router-dom";

// Layouts
import { LandingLayout } from "../layouts/LandingLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Pages / Features
import { Landing } from "../features/landing/Landing";
import { Login } from "../features/auth/Login";
import { Register } from "../features/auth/Register";
import { ForgotPassword } from "../features/auth/ForgotPassword";
import { ResetPassword } from "../features/auth/ResetPassword";
import { VerifyEmail } from "../features/auth/VerifyEmail";
import { EmailSent } from "../features/auth/EmailSent";
import { SessionExpired } from "../features/auth/SessionExpired";
import { Dashboard } from "../features/dashboard/Dashboard";
import {
  DatasetAnalytics,
  SavedDashboards,
} from "../features/dashboard/Dashboard";
import { Upload } from "../features/upload/Upload";
import { Projects } from "../features/projects/Projects";
import { Settings } from "../features/settings/Settings";
import { NotFound } from "../features/error/NotFound";
import {
  DatasetList,
  DatasetDetail,
  DatasetUpload,
} from "../features/datasets/pages";
import { MLWorkspace } from "../features/machine-learning/pages/MLWorkspace";
export const router = createBrowserRouter([
  // Public Landing Routes
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
    ],
  },
  // Auth Layout Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "email-sent",
        element: <EmailSent />,
      },
      {
        path: "session-expired",
        element: <SessionExpired />,
      },
    ],
  },
  // Protected Dashboard Routes
  {
    path: "dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "upload",
            element: <Upload />,
          },
          {
            path: "datasets",
            children: [
              {
                index: true,
                element: <DatasetList />,
              },
              {
                path: "upload",
                element: <DatasetUpload />,
              },
              {
                path: ":id",
                element: <DatasetDetail />,
              },
            ],
          },
          {
            path: "analytics",
            children: [
              {
                index: true,
                element: <Dashboard />,
              },
              {
                path: ":id",
                element: <DatasetAnalytics />,
              },
            ],
          },
          {
            path: "saved",
            element: <SavedDashboards />,
          },
          {
            path: "ml",
            element: <MLWorkspace />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
  // Catch All 404 Route
  {
    path: "*",
    element: <NotFound />,
  },
]);
