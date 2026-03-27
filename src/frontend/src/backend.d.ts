import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type CommentId = bigint;
export interface Comment {
    id: CommentId;
    authorId: Principal;
    createdAt: bigint;
    text: string;
    authorName: string;
    projectId: ProjectId;
}
export type ProjectId = bigint;
export interface Project {
    id: ProjectId;
    title: string;
    authorId: Principal;
    createdAt: bigint;
    tags: Array<string>;
    authorName: string;
    description: string;
    likedBy: Array<Principal>;
    innovationSummary: string;
    viewCount: bigint;
    commentCount: bigint;
    category: string;
    fileBlobIds: Array<string>;
}
export interface UserProfile {
    bio: string;
    principal: Principal;
    displayName: string;
    totalLikes: bigint;
    projectCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(projectId: ProjectId, text: string, authorName: string): Promise<Comment>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(title: string, description: string, tags: Array<string>, category: string, innovationSummary: string, fileBlobIds: Array<string>, authorName: string): Promise<Project>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: ProjectId): Promise<Project>;
    getProjectComments(projectId: ProjectId): Promise<Array<Comment>>;
    getProjects(category: string | null, searchQuery: string | null): Promise<Array<Project>>;
    getRecentActivity(): Promise<{
        projects: Array<Project>;
        comments: Array<Comment>;
    }>;
    getTopContributors(): Promise<Array<UserProfile>>;
    getUserProfile(userId: Principal): Promise<UserProfile>;
    getUserProjects(userId: Principal): Promise<Array<Project>>;
    isCallerAdmin(): Promise<boolean>;
    likeProject(id: ProjectId): Promise<bigint>;
    recordProjectView(id: ProjectId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateUserProfile(displayName: string, bio: string): Promise<void>;
}
