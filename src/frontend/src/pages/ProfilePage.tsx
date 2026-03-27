import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Edit2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import ProjectCard from "../components/ProjectCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetUserProjects,
} from "../hooks/useQueries";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const userId = identity?.getPrincipal().toString() || "";
  const { data: projects, isLoading: projectsLoading } =
    useGetUserProjects(userId);
  const { mutateAsync: saveProfile, isPending: saving } = useSaveUserProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="profile.error_state"
      >
        <p className="text-muted-foreground text-lg mb-4">
          Please login to view your profile
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          data-ocid="profile.button"
        >
          Go Home
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setName(profile?.displayName || "");
    setBio(profile?.bio || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const updated: UserProfile = {
        displayName: name.trim(),
        bio: bio.trim(),
        principal: identity.getPrincipal(),
        totalLikes: profile?.totalLikes ?? BigInt(0),
        projectCount: profile?.projectCount ?? BigInt(0),
      };
      await saveProfile(updated);
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-10 max-w-5xl"
    >
      {/* Profile Header */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8">
        <div
          className="h-28"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 240), oklch(0.3 0.1 185))",
          }}
        />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <Avatar className="w-20 h-20 border-4 border-card shadow-card">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {(profile?.displayName || "Me").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              {profileLoading ? (
                <Skeleton className="h-6 w-40" />
              ) : editing ? (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="edit-name">Display Name</Label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-8"
                      data-ocid="profile.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      data-ocid="profile.textarea"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {profile?.displayName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile?.bio || "No bio yet"}
                  </p>
                </div>
              )}
            </div>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-shrink-0"
                data-ocid="profile.edit_button"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  data-ocid="profile.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground"
                  onClick={handleSave}
                  disabled={saving}
                  data-ocid="profile.save_button"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {Number(profile?.projectCount ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {Number(profile?.totalLikes ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <h2 className="text-xl font-bold text-foreground mb-5">My Projects</h2>
      {projectsLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="profile.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : (projects ?? []).length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground bg-card rounded-2xl"
          data-ocid="profile.empty_state"
        >
          <p className="font-medium mb-2">No projects yet</p>
          <p className="text-sm">Upload your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(projects ?? []).map((project, i) => (
            <ProjectCard
              key={project.id.toString()}
              project={project}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
