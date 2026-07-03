import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@studio/ui";
import { authApi } from "../../api/auth";
import { AuthCard } from "./components/AuthCard";
import { FormError } from "./components/FormError";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const forgotMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      navigate("/email-sent?type=reset");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotFormValues) => {
    forgotMutation.mutate(data.email);
  };

  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email address and we'll send you a link to reset your password."
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Remember your password?{" "}
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
        <FormError message={forgotMutation.error?.message} />

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={
              errors.email
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={forgotMutation.isPending}
        >
          {forgotMutation.isPending ? "Sending link..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
};
