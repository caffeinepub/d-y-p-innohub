import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Project, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetProjects(category?: string, searchQuery?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", category, searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects(category ?? null, searchQuery ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProject(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Project>({
    queryKey: ["project", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProjectComments(projectId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectComments(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecentActivity() {
  const { actor, isFetching } = useActor();
  return useQuery<{ projects: Project[]; comments: Comment[] }>({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      if (!actor) return { projects: [], comments: [] };
      return actor.getRecentActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopContributors() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["topContributors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopContributors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getUserProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetUserProjects(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["userProjects", userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserProjects(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useLikeProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likeProject(id);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["project", id.toString()] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      text,
      authorName,
    }: { projectId: bigint; text: string; authorName: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addComment(projectId, text, authorName);
    },
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ["comments", projectId.toString()] });
      qc.invalidateQueries({ queryKey: ["recentActivity"] });
    },
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      tags: string[];
      category: string;
      innovationSummary: string;
      fileBlobIds: string[];
      authorName: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createProject(
        data.title,
        data.description,
        data.tags,
        data.category,
        data.innovationSummary,
        data.fileBlobIds,
        data.authorName,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["recentActivity"] });
      qc.invalidateQueries({ queryKey: ["topContributors"] });
    },
  });
}

// Uses the simpler updateUserProfile backend function (displayName + bio only)
export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
    }: { displayName: string; bio: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateUserProfile(displayName, bio);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
      qc.refetchQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
