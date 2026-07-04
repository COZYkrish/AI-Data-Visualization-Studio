import React, { useCallback, useState } from "react";
import { UploadCloud, File, AlertCircle, X, CheckCircle } from "lucide-react";
import { useUploadDataset } from "../hooks/useDatasets";
import { useDatasetStore } from "../store/datasetStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button, cn } from "@studio/ui";

export const UploadDropzone = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { mutate: uploadDataset, isPending } = useUploadDataset();
  const {
    currentUploads,
    uploadProgress,
    processingState,
    validationErrors,
    removeUpload,
  } = useDatasetStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Basic validation
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      const isValidType =
        [
          "text/csv",
          "application/json",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type) ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");
      return isValidSize && isValidType;
    });

    // Upload files
    validFiles.forEach((file) => {
      useDatasetStore.getState().addUpload(file);
      uploadDataset(file);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center group",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept=".csv,.json,.xls,.xlsx"
          multiple
        />

        <div className="bg-background p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-xl font-semibold mb-2">Upload your dataset</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Drag and drop your CSV, JSON, or Excel files here, or click to browse.
          Max size: 50MB.
        </p>

        <Button variant="outline" className="pointer-events-none">
          Select Files
        </Button>
      </div>

      {/* Upload Queue */}
      <AnimatePresence>
        {currentUploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Current Uploads
            </h4>
            {currentUploads.map((file) => {
              const progress = uploadProgress[file.name] || 0;
              const error = validationErrors[file.name];
              const state = processingState[file.name];

              return (
                <motion.div
                  key={file.name}
                  layout
                  className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-4 relative overflow-hidden"
                >
                  {/* Progress Bar Background */}
                  {state === "uploading" && !error && (
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary/10 -z-10"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  )}

                  <div className="bg-muted p-2 rounded-md">
                    <File className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {error ? (
                        <span className="text-destructive">Failed</span>
                      ) : state === "uploading" ? (
                        `${progress}% uploaded`
                      ) : (
                        "Processing..."
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {error && (
                      <div className="group relative">
                        <AlertCircle className="w-5 h-5 text-destructive cursor-help" />
                        <div className="absolute right-0 top-8 bg-popover text-popover-foreground text-xs p-2 rounded shadow-md w-48 hidden group-hover:block z-50">
                          {error}
                        </div>
                      </div>
                    )}
                    {state === "processing" && !error && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {state === "ready" && !error && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}

                    <button
                      onClick={() => removeUpload(file.name)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
