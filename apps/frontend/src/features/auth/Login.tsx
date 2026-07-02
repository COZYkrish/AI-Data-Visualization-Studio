import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../store";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  useToast,
} from "@studio/ui";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();
  const { toast } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Input Validation Error",
        description: "Please fill out all login credentials.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    // Mock API authenticate delay
    setTimeout(() => {
      setIsLoading(false);
      setUser({
        id: "usr_mock123",
        email: email,
        firstName: "Developer",
        lastName: "Studio",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setToken("mock_jwt_token_xyz_123");
      toast({
        title: "Access Granted",
        description: "Successfully signed in. Welcome to Studio.ai!",
        type: "success",
      });
      navigate("/dashboard");
    }, 800);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-sans">Sign In</CardTitle>
        <CardDescription>
          Enter your email below to log in to your dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-muted-foreground uppercase"
              htmlFor="email"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-muted-foreground uppercase"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In with Password"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
export default Login;
