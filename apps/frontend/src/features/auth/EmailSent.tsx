import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@studio/ui";
import { AuthCard } from "./components/AuthCard";
import { MailCheck } from "lucide-react";

export const EmailSent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "verify"; // "verify" or "reset"

  const content = {
    verify: {
      title: "Check your email",
      description:
        "We've sent a verification link to your email address. Please click the link to verify your account.",
    },
    reset: {
      title: "Check your email",
      description:
        "If an account exists with that email, we have sent a password reset link.",
    },
  }[type as "verify" | "reset"] || {
    title: "Check your email",
    description: "Please check your email for further instructions.",
  };

  return (
    <AuthCard title={content.title} description={content.description}>
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <MailCheck className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button variant="outline" className="w-full">
            <Link to={type === "reset" ? "/forgot-password" : "/login"}>
              Try again
            </Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
};
