import React, { useEffect, useState } from "react";
import { useReportStore } from "../../../store/report.store";
import { reportsApi } from "../../../api/reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Badge,
} from "@studio/ui";
import { formatDistanceToNow } from "date-fns";

export const ReportsDashboard: React.FC<{ projectId: string }> = ({
  projectId,
}) => {
  const { reports, setReports, exportJobs } = useReportStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await reportsApi.list(projectId);
        if (res.success && res.data) {
          setReports(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [projectId]);

  const jobsList = Object.values(exportJobs).filter(
    (j) => j.project_id === projectId,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Generated Reports</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {report.template_type}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Created{" "}
                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                })}
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground border rounded-xl border-dashed">
              No reports generated yet. Use the Report Builder to create one.
            </div>
          )}
        </div>
      )}

      {jobsList.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold">Recent Exports</h3>
          <div className="space-y-2">
            {jobsList.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium uppercase">
                    {job.format} Export
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      job.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {job.status}
                  </Badge>
                  {job.status === "completed" && job.file_url && (
                    <a
                      href={job.file_url}
                      className="text-sm text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
