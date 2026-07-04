import React from "react";
import { UploadDropzone } from "../components";
import { motion } from "framer-motion";

export const DatasetUpload = () => {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Upload Dataset
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your CSV or Excel files to automatically clean, parse, and
            analyze your data.
          </p>
        </div>

        <div className="bg-card shadow-sm border rounded-xl p-6 md:p-8">
          <UploadDropzone />
        </div>
      </motion.div>
    </div>
  );
};
