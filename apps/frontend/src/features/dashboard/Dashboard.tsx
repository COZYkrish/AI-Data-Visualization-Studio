import * as React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@studio/ui";
import {
  FolderKanban,
  Upload,
  AlertCircle,
  RefreshCw,
  BarChart4,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-lg p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-premium">
        <h2 className="text-2xl font-bold font-sans">Welcome to Studio.ai</h2>
        <p className="text-sm opacity-90 mt-1">
          Phase 1 Architecture Foundation is fully operational. Set up projects,
          ingest files, and prepare visualizations.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active workspaces configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Datasets
            </CardTitle>
            <Upload className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              Files uploaded in total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              API Status
            </CardTitle>
            <RefreshCw
              className="h-5 w-5 text-emerald-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-500">
              Active
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connection to backend healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Storage Usage
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">12.4 MB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of 100 MB free tier capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Scaffolding Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-sans flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-primary" />
              Interactive Analytics (Phase 2 Preview)
            </CardTitle>
            <CardDescription>
              A sandbox module where machine learning models and visualizations
              will be rendered.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border border-dashed rounded-md bg-muted/20 m-6 mt-0">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Visualization Sandbox Stacked
              </p>
              <p className="text-xs text-muted-foreground">
                Charts, stats summaries, and regressions will appear here.
              </p>
              <Link to="/dashboard/upload">
                <Button size="sm" variant="outline" className="mt-2">
                  Upload Data Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold font-sans">
              Recent Activity
            </CardTitle>
            <CardDescription>Workspace operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="font-semibold">Project 'SaaS Analysis' created</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
              <div>
                <p className="font-semibold">customer_churn.csv processed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
              <div>
                <p className="font-semibold">financials_q2.xlsx uploaded</p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
