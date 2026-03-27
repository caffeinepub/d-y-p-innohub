import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateProject, useGetCallerUserProfile } from "../hooks/useQueries";

const CATEGORIES = [
  "Technology",
  "Science",
  "Art & Design",
  "Engineering",
  "Business",
  "Other",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadProjectModal({ open, onClose }: Props) {
  const { data: profile } = useGetCallerUserProfile();
  const { mutateAsync, isPending } = useCreateProject();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [innovationSummary, setInnovationSummary] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!title || !category || !innovationSummary || !description) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const fileBlobIds: string[] = [];
      let totalProgress = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => {
          totalProgress = Math.round(((i + p / 100) / files.length) * 100);
          setUploadProgress(totalProgress);
        });
        const blobBytes = await blob.getBytes();
        fileBlobIds.push(btoa(String.fromCharCode(...blobBytes.slice(0, 32))));
      }
      await mutateAsync({
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        category,
        innovationSummary: innovationSummary.trim(),
        fileBlobIds,
        authorName: profile?.displayName || "Anonymous",
      });
      toast.success("Project uploaded successfully!");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upload Your Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="up-title">Project Title *</Label>
              <Input
                id="up-title"
                placeholder="My Amazing Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="upload.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-ocid="upload.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="up-tags">Tags (comma-separated)</Label>
            <Input
              id="up-tags"
              placeholder="AI, machine learning, robotics"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              data-ocid="upload.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="up-summary">Innovation Summary *</Label>
            <Textarea
              id="up-summary"
              placeholder="What makes your project innovative?"
              value={innovationSummary}
              onChange={(e) => setInnovationSummary(e.target.value)}
              rows={2}
              data-ocid="upload.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="up-desc">Full Description *</Label>
            <Textarea
              id="up-desc"
              placeholder="Describe your project in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              data-ocid="upload.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Attachments (images, documents)</Label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
              data-ocid="upload.dropzone"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {files.length > 0
                  ? files.map((f) => f.name).join(", ")
                  : "Click to upload files"}
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </button>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {files.map((f) => (
                  <span
                    key={f.name}
                    className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                  >
                    {f.name}
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((fl) => fl.name !== f.name))
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                  data-ocid="upload.loading_state"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="upload.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
                </>
              ) : (
                "Submit Project"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
