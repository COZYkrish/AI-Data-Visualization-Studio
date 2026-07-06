import React from "react";
import { useDatasets } from "../hooks/useDatasets";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@studio/ui";
import {
  Database,
  Plus,
  Clock,
  HardDrive,
  FileSpreadsheet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const DatasetList = () => {
  const { data: datasetsResponse, isLoading } = useDatasets();

  const formatBytes = (bytes: number) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and analyze your uploaded data.
          </p>
        </div>
        <Link to="/dashboard/datasets/upload">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Dataset
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : !datasetsResponse?.data?.items ||
        datasetsResponse.data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No datasets yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Upload your first dataset to start cleaning, analyzing, and
            visualizing your data.
          </p>
          <Link to="/dashboard/datasets/upload">
            <Button>Upload your first dataset</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasetsResponse.data.items.map((dataset) => (
            <Link
              key={dataset.id}
              to={`/dashboard/datasets/${dataset.id}`}
              className="group block"
            >
              <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary group-hover:h-1.5 transition-all" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={
                        dataset.upload_status === "ready"
                          ? "default"
                          : dataset.upload_status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {dataset.upload_status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {dataset.original_filename}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      {dataset.row_count?.toLocaleString() || 0} rows
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      {formatBytes(dataset.file_size)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Uploaded{" "}
                      {formatDistanceToNow(new Date(dataset.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
