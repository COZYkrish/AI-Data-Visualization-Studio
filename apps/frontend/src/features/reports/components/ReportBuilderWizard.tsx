import React, { useState } from "react";
import { useReportStore } from "../../../store/report.store";
import { reportsApi } from "../../../api/reports";
import { ExportFormat, Project } from "@studio/types";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Label,
  Select,
} from "@studio/ui";

interface ReportBuilderWizardProps {
  project: Project;
  onClose: () => void;
}

export const ReportBuilderWizard: React.FC<ReportBuilderWizardProps> = ({
  project,
  onClose,
}) => {
  const { isGenerating, setIsGenerating, setExportJob } = useReportStore();
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState(`${project.name} Report`);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [template, setTemplate] = useState("Executive Summary");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Create report first
      const reportRes = await reportsApi.create(project.id, {
        name: reportName,
        template_type: template,
        description: "Auto-generated report from wizard",
      });

      if (reportRes.success && reportRes.data) {
        // Request export
        const exportRes = await reportsApi.requestExport(
          project.id,
          format,
          reportRes.data.id,
        );
        if (exportRes.success && exportRes.data) {
          setExportJob(exportRes.data);
          setStep(3); // success step
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Report Builder - Step {step} of 2</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
              >
                <option value="Executive Summary">Executive Summary</option>
                <option value="Full Report">Complete Project Report</option>
                <option value="Analytics Report">Analytics Report</option>
                <option value="ML Report">Machine Learning Report</option>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-2 gap-4">
                {["pdf", "excel", "csv", "json"].map((f) => (
                  <Button
                    key={f}
                    variant={format === f ? "default" : "outline"}
                    onClick={() => setFormat(f as ExportFormat)}
                    className="uppercase"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 text-center space-y-4">
            <h3 className="text-xl font-medium">Export Started</h3>
            <p className="text-muted-foreground">
              Your report is being generated. You can check the status in the
              Export Jobs panel.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && step < 3 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step === 1 && (
          <Button onClick={() => setStep(2)} className="ml-auto">
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? "Generating..." : "Generate & Export"}
          </Button>
        )}
        {step === 3 && (
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
