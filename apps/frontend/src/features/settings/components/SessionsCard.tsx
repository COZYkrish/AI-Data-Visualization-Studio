import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../../../api/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@studio/ui";
import {
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@studio/ui";
import { Session } from "@studio/types";

export const SessionsCard: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessionsResponse, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: profileApi.getSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: profileApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({
        title: "Session Revoked",
        description: "The device has been signed out.",
        type: "success",
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: profileApi.revokeAllSessions,
    onSuccess: () => {
      // In a real app, if you revoke the current session, the interceptor will log you out
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({
        title: "All Sessions Revoked",
        description: "All devices have been signed out.",
        type: "success",
      });
    },
  });

  const getDeviceIcon = (session: Session) => {
    const os = session.operating_system?.toLowerCase() || "";
    if (os.includes("ios") || os.includes("android")) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (os.includes("mac") || os.includes("windows") || os.includes("linux")) {
      return <Monitor className="w-5 h-5" />;
    }
    return <Globe className="w-5 h-5" />;
  };

  const sessions = sessionsResponse?.data || [];

  return (
    <Card className="border-2 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices currently signed in to your account.
          </CardDescription>
        </div>
        {sessions.length > 1 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => revokeAllMutation.mutate()}
            disabled={revokeAllMutation.isPending}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Sign out all devices
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border rounded-lg border-dashed">
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary rounded-full text-foreground">
                    {getDeviceIcon(session)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {session.browser || "Unknown Browser"} on{" "}
                      {session.operating_system || "Unknown OS"}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>{session.ip_address || "Unknown IP"}</span>
                      <span>•</span>
                      <span>
                        Started{" "}
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive flex gap-2"
                    onClick={() => revokeMutation.mutate(session.id)}
                    disabled={revokeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                )}
                {session.is_current && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Current Device
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
