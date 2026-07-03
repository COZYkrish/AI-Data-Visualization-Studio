import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@studio/ui";
import { useAuthHooks } from "./hooks/useAuth";
import { AuthCard } from "./components/AuthCard";
import { PasswordInput } from "./components/PasswordInput";
import { FormError } from "./components/FormError";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { useLoginMutation } = useAuthHooks();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your workspace."
      footer={
        <>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={loginMutation.error?.message} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register("password")}
            error={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
};
