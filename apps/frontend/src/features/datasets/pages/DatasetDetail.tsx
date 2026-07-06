import React from "react";
import { useParams, Link } from "react-router-dom";
import { useDataset, useDatasetPreview } from "../hooks/useDatasets";
import { DatasetPreview, DatasetStatistics } from "../components";
import { Button, Badge, Skeleton } from "@studio/ui";
import { ArrowLeft, Download, Trash2, Calendar, FileType } from "lucide-react";
import { format } from "date-fns";

export const DatasetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: datasetResponse, isLoading: isDatasetLoading } = useDataset(
    id!,
  );
  const { data: previewResponse, isLoading: isPreviewLoading } =
    useDatasetPreview(id!);

  const dataset = datasetResponse?.data;
  const previewData = previewResponse?.data;

  if (isDatasetLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-7xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Dataset Not Found</h2>
        <Link to="/dashboard/datasets">
          <Button variant="outline">Back to Datasets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link
            to="/dashboard/datasets"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Datasets
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {dataset.original_filename}
            </h1>
            <Badge
              variant={
                dataset.upload_status === "ready" ? "default" : "secondary"
              }
            >
              {dataset.upload_status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(dataset.created_at), "PPP")}
            </span>
            <span className="flex items-center gap-1">
              <FileType className="w-4 h-4" />
              {dataset.file_type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="destructive" className="flex-1 md:flex-none gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      {dataset.upload_status === "ready" && dataset.metadata ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <DatasetStatistics dataset={dataset} metadata={dataset.metadata} />

          <div className="flex justify-between items-end mb-4 mt-8">
            <h2 className="text-xl font-semibold">Data Preview</h2>
            <p className="text-sm text-muted-foreground">
              Showing top 100 rows
            </p>
          </div>

          {isPreviewLoading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <DatasetPreview
              data={previewData?.rows || []}
              columns={previewData?.columns || []}
              dataTypes={dataset.metadata.detected_data_types || undefined}
            />
          )}
        </>
      ) : (
        <div className="bg-muted/30 border rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium mb-2">Dataset is processing</h3>
          <p className="text-muted-foreground">
            Current status: {dataset.upload_status}. Please check back in a
            moment.
          </p>
        </div>
      )}
    </div>
  );
};
