import React from "react";
import { ReportsDashboard } from "./pages/ReportsDashboard";

// Exporting with a default projectId for demonstration or this could come from route params
export const Reports: React.FC = () => {
  // In a real app, this would get the active project ID from the URL or context
  // Using a placeholder project ID for now, or just an empty one to show the structure
  const projectId = "default-project-id";
  return <ReportsDashboard projectId={projectId} />;
};

export default Reports;
