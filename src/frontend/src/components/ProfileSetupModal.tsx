import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const { mutateAsync, isPending } = useSaveUserProfile();

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!identity) return;
    try {
      const profile: UserProfile = {
        displayName: name.trim(),
        bio: bio.trim(),
        principal: identity.getPrincipal(),
        totalLikes: BigInt(0),
        projectCount: BigInt(0),
      };
      await mutateAsync(profile);
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" data-ocid="profile_setup.dialog">
        <DialogHeader>
          <DialogTitle>Welcome to EduProjectHub!</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Set up your profile to get started sharing projects.
        </p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="setup-name">Display Name *</Label>
            <Input
              id="setup-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="setup-bio">Bio (optional)</Label>
            <Textarea
              id="setup-bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              data-ocid="profile_setup.textarea"
            />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? "Saving..." : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
