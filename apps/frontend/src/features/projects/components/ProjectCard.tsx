import React from "react";
import { Project } from "@studio/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@studio/ui";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onClick?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
}) => {
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-all duration-300"
      onClick={() => onClick?.(project.id)}
    >
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>
          {project.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Version {project.version}</span>
          <span>{project.status}</span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Last updated{" "}
        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
      </CardFooter>
    </Card>
  );
};
