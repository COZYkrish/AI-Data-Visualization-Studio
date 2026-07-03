import * as React from "react";
import { useAuthHooks } from "../../auth/hooks/useAuth";
import { useUserStore } from "../../../store";
import { Button } from "@studio/ui";
import { Camera, Trash2, Loader2 } from "lucide-react";

export const AvatarUploader: React.FC = () => {
  const { user } = useUserStore();
  const { useUploadAvatarMutation, useDeleteAvatarMutation } = useAuthHooks();
  const uploadMutation = useUploadAvatarMutation();
  const deleteMutation = useDeleteAvatarMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
  const avatarUrl = user?.avatar_url
    ? `${API_BASE_URL.replace("/api/v1", "")}${user.avatar_url}`
    : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-muted-foreground uppercase">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "?"}
          </span>
        )}

        {(uploadMutation.isPending || deleteMutation.isPending) && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={uploadMutation.isPending || deleteMutation.isPending}
            className="flex gap-2"
          >
            <Camera className="w-4 h-4" />
            Upload Photo
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={uploadMutation.isPending || deleteMutation.isPending}
              className="flex gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Recommended: Square JPG, PNG, or WEBP, at least 256x256. Maximum size
          5MB.
        </p>
      </div>
    </div>
  );
};
