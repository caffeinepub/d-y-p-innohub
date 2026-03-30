import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project } from "../backend.d";
import { useStorageClient } from "../hooks/useStorageClient";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Technology:
    "linear-gradient(135deg, oklch(0.3 0.08 240 / 0.85), oklch(0.5 0.15 200 / 0.85))",
  Science:
    "linear-gradient(135deg, oklch(0.3 0.08 160 / 0.85), oklch(0.5 0.15 140 / 0.85))",
  "Art & Design":
    "linear-gradient(135deg, oklch(0.4 0.1 330 / 0.85), oklch(0.6 0.15 300 / 0.85))",
  Engineering:
    "linear-gradient(135deg, oklch(0.35 0.08 50 / 0.85), oklch(0.55 0.12 30 / 0.85))",
  Business:
    "linear-gradient(135deg, oklch(0.35 0.08 100 / 0.85), oklch(0.55 0.12 80 / 0.85))",
  Other:
    "linear-gradient(135deg, oklch(0.35 0.06 240 / 0.85), oklch(0.5 0.1 200 / 0.85))",
};

interface ThumbnailProps {
  hash: string;
  getImageURL: (hash: string) => Promise<string>;
}

function ProjectImageThumbnail({ hash, getImageURL }: ThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getImageURL(hash)
      .then(setUrl)
      .catch(() => {});
  }, [hash, getImageURL]);

  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: 100, background: "oklch(0.92 0.01 240)" }}
    >
      {url ? (
        <img
          src={url}
          alt="Project thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-gray-200" />
      )}
    </div>
  );
}

interface Props {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: Props) {
  const navigate = useNavigate();
  const { getImageURL } = useStorageClient();
  const gradient =
    CATEGORY_GRADIENTS[project.category] ?? CATEGORY_GRADIENTS.Other;

  const firstRealHash = project.fileBlobIds.find((id) =>
    id.startsWith("sha256:"),
  );

  return (
    <article
      className="rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200"
      style={{
        background: "oklch(1 0 0 / 0.72)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 12px oklch(0 0 0 / 0.10)",
      }}
      data-ocid={`projects.item.${index}`}
    >
      {firstRealHash ? (
        <ProjectImageThumbnail hash={firstRealHash} getImageURL={getImageURL} />
      ) : (
        <div
          className="h-16 flex items-center justify-center relative"
          style={{ background: gradient }}
        >
          <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/20">
            {project.category}
          </span>
        </div>
      )}

      <div className="p-3 flex flex-col flex-1 gap-2">
        {firstRealHash && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full self-start"
            style={{
              background: gradient,
              color: "white",
            }}
          >
            {project.category}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <AvatarFallback className="bg-primary/20 text-primary text-[9px]">
              {project.authorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground font-medium">
            {project.authorName}
          </span>
        </div>

        <h3 className="text-foreground font-semibold text-sm leading-snug line-clamp-1">
          {project.title}
        </h3>

        <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 flex-1">
          {project.innovationSummary}
        </p>

        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[9px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Eye className="w-2.5 h-2.5" />
              {Number(project.viewCount)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5" />
              {project.likedBy.length}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-2.5 h-2.5" />
              {Number(project.commentCount)}
            </span>
          </div>
          <Button
            size="sm"
            className="rounded-lg text-[10px] font-semibold h-6 px-2.5"
            style={{
              background: "oklch(0.92 0.04 185)",
              color: "oklch(0.3 0.1 185)",
            }}
            onClick={() =>
              navigate({
                to: "/project/$id",
                params: { id: project.id.toString() },
              })
            }
            data-ocid={`projects.button.${index}`}
          >
            View
          </Button>
        </div>
      </div>
    </article>
  );
}
