import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@studio/ui";
import { FileQuestion, MoveLeft } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-4 max-w-md">
        <div className="flex justify-center">
          <FileQuestion className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold font-sans">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground">
          The dashboard module or endpoint you are looking for does not exist in
          Phase 1 or might have moved.
        </p>
        <div className="pt-4 flex justify-center">
          <Link to="/">
            <Button className="flex items-center gap-2">
              <MoveLeft className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
