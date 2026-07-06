import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@studio/ui";
import { Database, FileDigit, HardDrive, AlertTriangle } from "lucide-react";
import { Dataset, DatasetMetadata } from "../types";

interface DatasetStatisticsProps {
  dataset: Dataset;
  metadata: DatasetMetadata;
}

export const DatasetStatistics: React.FC<DatasetStatisticsProps> = ({
  dataset,
  metadata,
}) => {
  const formatBytes = (bytes: number | null, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const totalMissing = metadata.missing_values
    ? (Object.values(metadata.missing_values).reduce(
        (a: any, b: any) => a + b,
        0,
      ) as number)
    : 0;

  const dataTypes = metadata.detected_data_types || {};
  const dataTypesValues = Object.values(dataTypes) as React.ReactNode[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-card shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dataset.row_count ? dataset.row_count.toLocaleString() : "0"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Processed rows</p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Columns</CardTitle>
          <FileDigit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dataset.column_count || 0}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {dataTypesValues.slice(0, 3).map((type, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] px-1 py-0"
              >
                {type}
              </Badge>
            ))}
            {dataTypesValues.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{dataTypesValues.length - 3}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(metadata.memory_usage)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Optimized dataframe size
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">
            Data Quality Issues
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {totalMissing > 0 ? totalMissing.toLocaleString() : "None"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Missing values detected & handled
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
