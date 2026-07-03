import * as React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Label } from "@studio/ui";
import { authApi } from "../../api/auth";
import { AuthCard } from "./components/AuthCard";
import { PasswordInput } from "./components/PasswordInput";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { FormError } from "./components/FormError";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@studio/ui";
import { AlertCircle } from "lucide-react";

const resetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: (data: { token: string; new_password: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
        type: "success",
      });
      navigate("/login");
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const passwordValue = watch("new_password");

  const onSubmit = (data: ResetFormValues) => {
    if (!token) return;
    resetMutation.mutate({ token, new_password: data.new_password });
  };

  if (!token) {
    return (
      <AuthCard
        title="Invalid Link"
        description="This password reset link is invalid or has expired."
      >
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link.
          </p>
          <Button onClick={() => navigate("/forgot-password")}>
            Request new link
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create new password"
      description="Please enter your new password below."
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={resetMutation.error?.message} />

        <div className="space-y-2">
          <Label htmlFor="new_password">New Password</Label>
          <PasswordInput
            id="new_password"
            placeholder="Enter new password"
            {...register("new_password")}
            error={!!errors.new_password}
          />
          {passwordValue && <PasswordStrengthMeter password={passwordValue} />}
          {errors.new_password && !passwordValue && (
            <p className="text-xs text-destructive">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm New Password</Label>
          <PasswordInput
            id="confirm_password"
            placeholder="Confirm new password"
            {...register("confirm_password")}
            error={!!errors.confirm_password}
          />
          {errors.confirm_password && (
            <p className="text-xs text-destructive">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  );
};
