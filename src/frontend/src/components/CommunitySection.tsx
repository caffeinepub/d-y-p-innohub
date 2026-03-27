import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Trophy } from "lucide-react";
import type { Comment, Project } from "../backend.d";
import {
  useGetRecentActivity,
  useGetTopContributors,
} from "../hooks/useQueries";

const SAMPLE_ACTIVITY = {
  projects: [
    {
      id: BigInt(1),
      title: "AI-Powered Study Assistant",
      authorName: "Priya Sharma",
      category: "Technology",
    },
    {
      id: BigInt(2),
      title: "Biodegradable Packaging Research",
      authorName: "Miguel Torres",
      category: "Science",
    },
  ] as Partial<Project>[],
  comments: [
    {
      text: "This is truly innovative!",
      authorName: "Alex Kim",
      projectId: BigInt(1),
    } as Partial<Comment>,
  ],
};

const SAMPLE_CONTRIBUTORS = [
  {
    displayName: "Priya Sharma",
    projectCount: BigInt(8),
    totalLikes: BigInt(142),
  },
  {
    displayName: "Miguel Torres",
    projectCount: BigInt(6),
    totalLikes: BigInt(98),
  },
  { displayName: "Alex Kim", projectCount: BigInt(5), totalLikes: BigInt(87) },
  {
    displayName: "Sarah Chen",
    projectCount: BigInt(4),
    totalLikes: BigInt(73),
  },
];

export default function CommunitySection() {
  const navigate = useNavigate();
  const { data: activity, isLoading: actLoading } = useGetRecentActivity();
  const { data: contributors, isLoading: ctrLoading } = useGetTopContributors();

  const displayActivity =
    activity?.projects?.length || activity?.comments?.length
      ? activity
      : SAMPLE_ACTIVITY;
  const displayContributors = contributors?.length
    ? contributors
    : SAMPLE_CONTRIBUTORS;

  return (
    <section id="community" className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-8">
          Community Hub
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Activity
            </h3>

            {actLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayActivity.projects?.slice(0, 4).map((p, i) => (
                  <button
                    type="button"
                    key={p.id?.toString() ?? `proj-${i}`}
                    className="w-full bg-card rounded-lg p-4 flex items-center gap-3 shadow-xs cursor-pointer hover:shadow-card transition-shadow text-left"
                    onClick={() =>
                      p.id &&
                      navigate({
                        to: "/project/$id",
                        params: { id: p.id.toString() },
                      })
                    }
                    data-ocid={`community.item.${i + 1}`}
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(p.authorName || "???").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.authorName} posted a new project
                      </p>
                    </div>
                    <span className="text-[10px] text-white px-2 py-0.5 rounded-full bg-primary">
                      {p.category}
                    </span>
                  </button>
                ))}
                {displayActivity.comments?.slice(0, 2).map((c, i) => (
                  <div
                    key={c.text?.slice(0, 16) ?? `comment-${i}`}
                    className="bg-card rounded-lg p-4 flex items-center gap-3 shadow-xs"
                    data-ocid={`community.item.${(displayActivity.projects?.length || 0) + i + 1}`}
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {(c.authorName || "???").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {c.authorName} commented
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        &ldquo;{c.text}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Innovators */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-secondary" /> Top Innovators
            </h3>

            {ctrLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayContributors.slice(0, 5).map((u, i) => (
                  <div
                    key={u.displayName}
                    className="bg-card rounded-lg p-3 flex items-center gap-3 shadow-xs"
                    data-ocid={`innovators.item.${i + 1}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {u.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.displayName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {Number(u.projectCount)} projects ·{" "}
                        {Number(u.totalLikes)} likes
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      data-ocid={`innovators.button.${i + 1}`}
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
