import * as React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({
  message = "Something went wrong",
  onRetry,
}) => (
  <div
    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center"
    role="alert"
  >
    <AlertCircle className="h-8 w-8 text-destructive" />
    <div>
      <p className="text-sm font-semibold text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs font-medium underline text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);
