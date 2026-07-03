import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@studio/ui";
import { useAuthHooks } from "./hooks/useAuth";
import { AuthCard } from "./components/AuthCard";
import { PasswordInput } from "./components/PasswordInput";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { FormError } from "./components/FormError";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: z
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
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { useRegisterMutation } = useAuthHooks();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = (data: RegisterFormValues) => {
    // Send only what API expects
    const apiData = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
    };
    registerMutation.mutate(apiData);
  };

  return (
    <AuthCard
      title="Create an account"
      description="Join thousands of teams analyzing data with Studio.ai."
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={registerMutation.error?.message} />

        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="Jane Doe"
            {...register("full_name")}
            className={
              errors.full_name
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            {...register("password")}
            error={!!errors.password}
          />
          {passwordValue && <PasswordStrengthMeter password={passwordValue} />}
          {errors.password && !passwordValue && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <PasswordInput
            id="confirm_password"
            placeholder="Confirm your password"
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
};
