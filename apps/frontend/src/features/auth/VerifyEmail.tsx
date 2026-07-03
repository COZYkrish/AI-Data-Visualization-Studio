import * as React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@studio/ui";
import { authApi } from "../../api/auth";
import { AuthCard } from "./components/AuthCard";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { data, error, isLoading } = useQuery({
    queryKey: ["verifyEmail", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      return authApi.verifyEmail(token);
    },
    enabled: !!token,
    retry: false,
  });

  if (!token) {
    return (
      <AuthCard
        title="Invalid Link"
        description="This verification link is invalid."
      >
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Please make sure you copied the entire link from your email.
          </p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Email Verification"
      description="Verifying your email address..."
      footer={
        <p className="text-sm text-center text-muted-foreground">
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[200px]">
        {isLoading && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-medium">Verifying your account...</p>
          </>
        )}

        {!isLoading && error && (
          <>
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Verification Failed
            </p>
            <p className="text-sm text-muted-foreground">
              {error.message ||
                "The verification link is invalid or has expired."}
            </p>
            <Button onClick={() => navigate("/login")} className="mt-4">
              Return to login
            </Button>
          </>
        )}

        {!isLoading && data?.success && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Email Verified Successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Your account has been verified. You can now access all features.
            </p>
            <Button onClick={() => navigate("/login")} className="mt-4 w-full">
              Sign in to continue
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  );
};
