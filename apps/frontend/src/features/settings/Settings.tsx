import * as React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  useToast,
} from "@studio/ui";
import { useThemeStore } from "../../store";
import { Sun, Moon, Monitor, ShieldCheck, Key } from "lucide-react";

export const Settings: React.FC = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = React.useState("Developer Account");
  const [apiKey, setApiKey] = React.useState("sk_test_••••••••••••••••••••");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Profile information updated successfully.",
      type: "success",
    });
  };

  const handleRegenKey = () => {
    const nextKey =
      "sk_live_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setApiKey(nextKey);
    toast({
      title: "API Key Regenerated",
      description: "Ensure you update your local environment files.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Toggler Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-sans">
            Theme Preference
          </CardTitle>
          <CardDescription>Customize the application theme.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
            className="flex items-center gap-2"
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
            className="flex items-center gap-2"
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            System
          </Button>
        </CardContent>
      </Card>

      {/* Profile Form settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-sans">
            Account Details
          </CardTitle>
          <CardDescription>Modify developer information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase text-muted-foreground"
                htmlFor="name"
              >
                Full Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Access Role
              </label>
              <div className="flex items-center gap-2 bg-muted/30 p-2.5 rounded-md border text-sm font-medium">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Administrator Workspace Account
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save profile changes</Button>
          </CardFooter>
        </form>
      </Card>

      {/* API Token keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-sans">
            SaaS API Integration Keys
          </CardTitle>
          <CardDescription>
            Manage keys used for pipeline interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={apiKey} readOnly />
            </div>
            <Button variant="outline" onClick={handleRegenKey}>
              Regenerate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Do not share this token in public code repositories. Refer to
            documentation on secret variables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default Settings;
