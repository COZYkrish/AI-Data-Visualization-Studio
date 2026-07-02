import * as React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  useToast,
} from "@studio/ui";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export const Upload: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "success">(
    "idle",
  );
  const [progress, setProgress] = React.useState(0);

  const mockColumns = [
    {
      name: "customer_id",
      type: "Categorical",
      nullCount: 0,
      distinctValues: 1000,
    },
    { name: "age", type: "Numeric", nullCount: 12, distinctValues: 74 },
    {
      name: "signup_date",
      type: "Datetime",
      nullCount: 0,
      distinctValues: 365,
    },
    {
      name: "monthly_spend",
      type: "Numeric",
      nullCount: 0,
      distinctValues: 890,
    },
    { name: "churn", type: "Boolean", nullCount: 0, distinctValues: 2 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setProgress(0);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setStatus("uploading");
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("success");
          toast({
            title: "File Processed Successfully",
            description: `${file.name} has been parsed and loaded into workspace memory.`,
            type: "success",
          });
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-sans">
            Smart Dataset Ingestion
          </CardTitle>
          <CardDescription>
            Drag and drop files to securely ingest data and trigger automatic
            column profiling. Supports CSV, XLSX, JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-muted/10 transition-colors hover:bg-muted/20">
            <UploadCloud
              className="h-12 w-12 text-primary/70 mb-4 animate-bounce"
              style={{ animationDuration: "3s" }}
            />
            <input
              type="file"
              id="file-selector"
              className="hidden"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-selector"
              className="cursor-pointer text-sm font-semibold text-primary hover:underline"
            >
              Click to select file
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              or drag & drop here (max 50MB)
            </p>
            {file && (
              <div className="mt-6 flex items-center gap-3 bg-card border p-3 rounded-md shadow-sm">
                <FileText className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {file && status !== "success" && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpload} disabled={status === "uploading"}>
                {status === "uploading"
                  ? `Uploading (${progress}%)`
                  : "Start Analysis"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {status === "success" && (
        <Card className="animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-sans flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Column Profiler Analysis
            </CardTitle>
            <CardDescription>
              We identified {mockColumns.length} columns. Review the inferred
              datatypes below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Inferred Type</TableHead>
                  <TableHead>Null Values</TableHead>
                  <TableHead>Distinct Values</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockColumns.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="font-semibold">{col.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{col.type}</Badge>
                    </TableCell>
                    <TableCell
                      className={
                        col.nullCount > 0
                          ? "text-amber-500 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {col.nullCount}{" "}
                      {col.nullCount > 0 && (
                        <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />
                      )}
                    </TableCell>
                    <TableCell>{col.distinctValues}</TableCell>
                    <TableCell>
                      <Badge variant="success">Validated</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
export default Upload;
