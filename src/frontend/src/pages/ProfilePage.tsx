import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Edit2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import ProjectCard from "../components/ProjectCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetUserProjects,
  useSaveUserProfile,
} from "../hooks/useQueries";

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
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    if (!userId) return "";
    return localStorage.getItem(`profilePhoto_${userId}`) || "";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!identity) {
    return (
      <div
        className="min-h-screen bg-sky-50 flex items-center justify-center"
        data-ocid="profile.error_state"
      >
        <div className="text-center">
          <p className="text-gray-700 text-lg mb-4">
            Please login to view your profile
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            data-ocid="profile.button"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoUrl(dataUrl);
      localStorage.setItem(`profilePhoto_${userId}`, dataUrl);
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

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
    <div className="min-h-screen bg-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-10 max-w-5xl"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 border border-blue-100">
          <div
            className="h-28"
            style={{
              background:
                "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)",
            }}
          />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              {/* Clickable Avatar with camera overlay — use label for file input */}
              <label
                htmlFor="profile-photo-input"
                className="relative group cursor-pointer"
                data-ocid="profile.upload_button"
              >
                <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                  {photoUrl && (
                    <AvatarImage src={photoUrl} alt="Profile photo" />
                  )}
                  <AvatarFallback className="bg-blue-200 text-blue-900 text-2xl font-bold">
                    {(profile?.displayName || "Me").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </label>
              <input
                id="profile-photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                data-ocid="profile.dropzone"
              />

              <div className="flex-1 pb-1">
                {profileLoading ? (
                  <Skeleton className="h-6 w-40" />
                ) : editing ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="edit-name"
                        className="text-gray-800 font-medium"
                      >
                        Display Name
                      </Label>
                      <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 text-gray-900 border-blue-200 focus:border-blue-400"
                        data-ocid="profile.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="edit-bio"
                        className="text-gray-800 font-medium"
                      >
                        Bio
                      </Label>
                      <Textarea
                        id="edit-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={2}
                        className="text-gray-900 border-blue-200 focus:border-blue-400"
                        data-ocid="profile.textarea"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {profile?.displayName || "Your Name"}
                    </h1>
                    <p className="text-sm text-gray-600">
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
                  className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
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
                    className="border-gray-300 text-gray-700"
                    data-ocid="profile.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
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
            <div className="flex gap-6 bg-blue-50 rounded-xl px-4 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Number(profile?.projectCount ?? 0)}
                </p>
                <p className="text-xs text-gray-600 font-medium">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Number(profile?.totalLikes ?? 0)}
                </p>
                <p className="text-xs text-gray-600 font-medium">Total Likes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">My Projects</h2>
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
            className="text-center py-16 text-gray-600 bg-white rounded-2xl border border-blue-100"
            data-ocid="profile.empty_state"
          >
            <p className="font-medium mb-2 text-gray-800">No projects yet</p>
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
    </div>
  );
}
