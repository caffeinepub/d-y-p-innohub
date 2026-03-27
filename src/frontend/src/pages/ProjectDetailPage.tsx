import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useGetCallerUserProfile,
  useGetProject,
  useGetProjectComments,
  useLikeProject,
} from "../hooks/useQueries";

export default function ProjectDetailPage() {
  const { id } = useParams({ from: "/project/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const projectId = BigInt(id);

  const { data: project, isLoading } = useGetProject(projectId);
  const { data: comments, isLoading: commentsLoading } =
    useGetProjectComments(projectId);
  const likeMutation = useLikeProject();
  const commentMutation = useAddComment();

  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!identity) {
      toast.error("Please login to like projects");
      return;
    }
    try {
      await likeMutation.mutateAsync(projectId);
      toast.success("Liked!");
    } catch {
      toast.error("Failed to like project");
    }
  };

  const handleComment = async () => {
    if (!identity) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;
    try {
      await commentMutation.mutateAsync({
        projectId,
        text: commentText.trim(),
        authorName: profile?.displayName || "Anonymous",
      });
      setCommentText("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-6 w-2/3 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="project.error_state"
      >
        <p className="text-muted-foreground">Project not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          className="mt-4"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/" })}
        className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
        data-ocid="project.button"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Button>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-6">
        <div
          className="h-32"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.3 0.08 240), oklch(0.5 0.15 185))",
          }}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <Badge className="mb-2 bg-primary/10 text-primary border-0">
                {project.category}
              </Badge>
              <h1 className="text-2xl font-bold text-foreground leading-snug">
                {project.title}
              </h1>
            </div>
            <Button
              onClick={handleLike}
              variant="outline"
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              disabled={likeMutation.isPending}
              data-ocid="project.button"
            >
              <Heart className="w-4 h-4" />
              {project.likedBy.length} Likes
            </Button>
          </div>

          <div className="flex items-center gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {project.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {project.authorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    Number(project.createdAt) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {Number(project.viewCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {Number(project.commentCount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: "oklch(0.94 0.02 185)" }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-1">
              💡 Innovation Summary
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {project.innovationSummary}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">
              About this Project
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-bold text-foreground text-lg mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Comments ({comments?.length ?? 0})
        </h2>

        {identity ? (
          <div className="flex gap-3 mb-6">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {(profile?.displayName || "Me").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                data-ocid="comment.textarea"
              />
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={handleComment}
                disabled={commentMutation.isPending || !commentText.trim()}
                data-ocid="comment.submit_button"
              >
                {commentMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Send className="w-3 h-3 mr-1" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-muted text-sm text-muted-foreground text-center">
            <button
              type="button"
              onClick={() => {}}
              className="text-primary underline"
            >
              Login
            </button>{" "}
            to leave a comment
          </div>
        )}

        {commentsLoading ? (
          <div className="space-y-4" data-ocid="comment.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(comments ?? []).map((comment, i) => (
              <div
                key={comment.id.toString()}
                className="flex gap-3"
                data-ocid={`comment.item.${i + 1}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {comment.authorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        Number(comment.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
            {(comments ?? []).length === 0 && (
              <p
                className="text-center text-muted-foreground text-sm py-6"
                data-ocid="comment.empty_state"
              >
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
