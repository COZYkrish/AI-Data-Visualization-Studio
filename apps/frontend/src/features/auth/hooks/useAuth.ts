import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, profileApi } from "../../../api/auth";
import { useUserStore } from "../../../store";
import { useToast } from "@studio/ui";
import { useNavigate } from "react-router-dom";

export const useAuthHooks = () => {
  const { setToken, setUser, logout, isAuthenticated } = useUserStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Current User Query
  const useCurrentUser = () => {
    return useQuery({
      queryKey: ["currentUser"],
      queryFn: async () => {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          return response.data;
        }
        throw new Error(response.message);
      },
      enabled: isAuthenticated, // Only fetch if we have a token
      retry: false, // Don't retry auth checks
    });
  };

  // 2. Login Mutation
  const useLoginMutation = () => {
    return useMutation({
      mutationFn: authApi.login,
      onSuccess: (data) => {
        if (data.success && data.data) {
          setToken(data.data.access_token);
          setUser(data.data.user);
          queryClient.setQueryData(["currentUser"], data.data.user);
          navigate("/dashboard");
          toast({
            title: "Welcome back",
            description: "Successfully signed in.",
            type: "success",
          });
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Sign In Failed",
          description:
            error?.message || "Invalid credentials. Please try again.",
          type: "error",
        });
      },
    });
  };

  // 3. Register Mutation
  const useRegisterMutation = () => {
    return useMutation({
      mutationFn: authApi.register,
      onSuccess: (data) => {
        if (data.success) {
          navigate("/email-sent?type=register");
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Registration Failed",
          description: error?.message || "Could not create account.",
          type: "error",
        });
      },
    });
  };

  // 4. Logout Mutation
  const useLogoutMutation = () => {
    return useMutation({
      mutationFn: authApi.logout,
      onSettled: () => {
        // Clear state regardless of server response
        logout();
        queryClient.clear(); // Clear all cached queries
        navigate("/login");
        toast({
          title: "Signed Out",
          description: "You have been securely signed out.",
          type: "default",
        });
      },
    });
  };

  // 5. Update Profile Mutation
  const useUpdateProfileMutation = () => {
    return useMutation({
      mutationFn: profileApi.updateProfile,
      onSuccess: (data) => {
        if (data.success && data.data) {
          setUser(data.data);
          queryClient.setQueryData(["currentUser"], data.data);
          toast({
            title: "Profile Updated",
            description: "Your profile has been saved.",
            type: "success",
          });
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Update Failed",
          description: error?.message || "Could not save profile.",
          type: "error",
        });
      },
    });
  };

  // 6. Upload Avatar Mutation
  const useUploadAvatarMutation = () => {
    return useMutation({
      mutationFn: profileApi.uploadAvatar,
      onSuccess: (data) => {
        if (data.success && data.data) {
          // Invalidate user query to fetch new avatar URL
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
          toast({
            title: "Avatar Uploaded",
            description: "Your profile picture has been updated.",
            type: "success",
          });
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Upload Failed",
          description: error?.message || "Could not upload image.",
          type: "error",
        });
      },
    });
  };

  // 7. Delete Avatar Mutation
  const useDeleteAvatarMutation = () => {
    return useMutation({
      mutationFn: profileApi.deleteAvatar,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        toast({
          title: "Avatar Removed",
          description: "Your profile picture has been cleared.",
          type: "default",
        });
      },
    });
  };

  return {
    useCurrentUser,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useDeleteAvatarMutation,
  };
};
