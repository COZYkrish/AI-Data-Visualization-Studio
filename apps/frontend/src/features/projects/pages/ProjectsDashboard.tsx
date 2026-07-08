import React, { useEffect, useState } from "react";
import { useProjectStore } from "../../../store/project.store";
import { projectsApi } from "../../../api/projects";
import { ProjectCard } from "../components/ProjectCard";
import { Button, Input, Skeleton } from "@studio/ui";
import { PlusCircle, Search } from "lucide-react";

export const ProjectsDashboard: React.FC = () => {
  const { savedProjects, setSavedProjects, isLoading, setLoading, setError } =
    useProjectStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await projectsApi.list();
        if (res.success && res.data) {
          setSavedProjects(res.data);
        }
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = savedProjects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your analytics workspaces and reports.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Get started by creating a new project.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
