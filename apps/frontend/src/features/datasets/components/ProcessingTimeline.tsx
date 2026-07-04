import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileType,
  Sparkles,
  LineChart,
  CheckCircle2,
} from "lucide-react";
import { UploadStatus } from "../types";
import { cn } from "@studio/ui";

interface ProcessingTimelineProps {
  status: UploadStatus;
  progress: number;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  status,
  progress,
}) => {
  const steps = [
    { id: "uploading", label: "Uploading", icon: Upload },
    { id: "parsing", label: "Parsing Data", icon: FileType },
    { id: "cleaning", label: "Cleaning & Normalizing", icon: Sparkles },
    { id: "analyzing", label: "Analyzing Structure", icon: LineChart },
    { id: "ready", label: "Ready", icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = [
      "uploading",
      "parsing",
      "cleaning",
      "analyzing",
      "metadata_generation",
      "ready",
    ];

    // Treat metadata_generation as part of analyzing visually
    const mappedStatus =
      status === "metadata_generation" ? "analyzing" : status;

    const currentIndex = statusOrder.indexOf(mappedStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    if (status === "failed") return "error";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between items-center max-w-4xl mx-auto">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
          {/* Active Track */}
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: stepStatus === "current" ? 1.2 : 1,
                  backgroundColor:
                    stepStatus === "completed"
                      ? "hsl(var(--primary))"
                      : stepStatus === "current"
                        ? "hsl(var(--background))"
                        : "hsl(var(--muted))",
                  borderColor:
                    stepStatus === "current"
                      ? "hsl(var(--primary))"
                      : "transparent",
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-300",
                  stepStatus === "completed"
                    ? "text-primary-foreground"
                    : stepStatus === "current"
                      ? "text-primary border-primary"
                      : "text-muted-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              <div className="absolute top-14 w-32 text-center -translate-x-1/2 left-1/2">
                <p
                  className={cn(
                    "text-xs font-medium transition-colors duration-300",
                    stepStatus === "current"
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {stepStatus === "current" && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {progress}%
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
