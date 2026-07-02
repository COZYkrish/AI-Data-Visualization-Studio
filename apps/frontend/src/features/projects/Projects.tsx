import * as React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  useToast,
} from "@studio/ui";
import { FolderKanban, Plus, Calendar, FileSpreadsheet } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  datasetCount: number;
  updatedAt: string;
}

export const Projects: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [projectDesc, setProjectDesc] = React.useState("");

  const [projects, setProjects] = React.useState<ProjectItem[]>([
    {
      id: "prj_001",
      name: "SaaS Financial Analysis",
      description: "Q2 Financial analysis models and forecasts.",
      datasetCount: 2,
      updatedAt: "2026-07-01",
    },
    {
      id: "prj_002",
      name: "E-Commerce User Retention",
      description: "User signups, behaviors, purchases, and churn metrics.",
      datasetCount: 1,
      updatedAt: "2026-06-28",
    },
  ]);

  const handleCreate = () => {
    if (!projectName) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        type: "error",
      });
      return;
    }

    const newProject: ProjectItem = {
      id: `prj_00${projects.length + 1}`,
      name: projectName,
      description: projectDesc || "No description provided.",
      datasetCount: 0,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setProjects([...projects, newProject]);
    setIsOpen(false);
    setProjectName("");
    setProjectDesc("");
    toast({
      title: "Project Initialized",
      description: `Project '${projectName}' created successfully.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-sans">Projects Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Manage and configure your analytics sandboxes.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card
            key={proj.id}
            className="flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200"
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  {proj.id}
                </span>
              </div>
              <CardTitle className="text-lg font-bold font-sans truncate">
                {proj.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {proj.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                {proj.datasetCount} Datasets
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {proj.updatedAt}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)}>
          <DialogHeader>
            <DialogTitle>Initialize New Project</DialogTitle>
            <DialogDescription>
              Create a workspace container to store datasets and generate
              charts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase text-muted-foreground"
                htmlFor="pname"
              >
                Project Name
              </label>
              <Input
                id="pname"
                placeholder="e.g. Sales Pipeline Analysis"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase text-muted-foreground"
                htmlFor="pdesc"
              >
                Description
              </label>
              <Input
                id="pdesc"
                placeholder="Brief summary of intent"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Workspace</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Projects;
