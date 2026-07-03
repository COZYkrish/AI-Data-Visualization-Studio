import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@studio/ui";
import { AuthCard } from "./components/AuthCard";
import { Clock } from "lucide-react";
import { useUserStore } from "../../store";

export const SessionExpired: React.FC = () => {
  const navigate = useNavigate();
  const { sessionStatus, logout } = useUserStore();

  React.useEffect(() => {
    // If they aren't marked as expired, redirect to login
    if (sessionStatus !== "expired") {
      navigate("/login");
    }
  }, [sessionStatus, navigate]);

  const handleLogin = () => {
    logout(); // This resets sessionStatus to "unauthenticated"
    navigate("/login");
  };

  return (
    <AuthCard
      title="Session Expired"
      description="For your security, your session has expired."
    >
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-amber-500/10 p-4 rounded-full">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Please sign in again to continue working.
        </p>
        <Button className="w-full" onClick={handleLogin}>
          Sign in again
        </Button>
      </div>
    </AuthCard>
  );
};
