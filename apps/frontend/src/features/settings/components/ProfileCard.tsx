import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
} from "@studio/ui";
import { useUserStore } from "../../../store";
import { useAuthHooks } from "../../auth/hooks/useAuth";
import { AvatarUploader } from "./AvatarUploader";
import { FormError } from "../../auth/components/FormError";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  timezone: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileCard: React.FC = () => {
  const { user } = useUserStore();
  const { useUpdateProfileMutation } = useAuthHooks();
  const updateMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      timezone:
        user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Card className="border-2 border-border/50">
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>
          Manage your public profile information and avatar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUploader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormError message={updateMutation.error?.message} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Jane Doe"
                {...register("full_name")}
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="janedoe"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a little about yourself"
              {...register("bio")}
              className={
                errors.bio
                  ? "border-destructive min-h-[100px]"
                  : "min-h-[100px]"
              }
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              {...register("timezone")}
              readOnly
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Auto-detected from your browser.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
