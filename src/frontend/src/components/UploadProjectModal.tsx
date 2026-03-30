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
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateProject, useGetCallerUserProfile } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const CATEGORIES = [
  "Technology",
  "Science",
  "Art & Design",
  "Engineering",
  "Business",
  "Other",
];

const MAX_IMAGES = 10;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadProjectModal({ open, onClose }: Props) {
  const { data: profile } = useGetCallerUserProfile();
  const { mutateAsync, isPending } = useCreateProject();
  const { uploadImages } = useStorageClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [innovationSummary, setInnovationSummary] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  // Keep a ref to current previews for cleanup on unmount
  const imagePreviewsRef = useRef<string[]>([]);
  imagePreviewsRef.current = imagePreviews;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of imagePreviewsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const combined = [...images, ...selected];
    if (combined.length > MAX_IMAGES) {
      toast.warning(
        `Maximum ${MAX_IMAGES} images allowed. Taking first ${MAX_IMAGES}.`,
      );
    }
    const capped = combined.slice(0, MAX_IMAGES);
    // Revoke old previews
    for (const url of imagePreviews) {
      URL.revokeObjectURL(url);
    }
    const newPreviews = capped.map((f) => URL.createObjectURL(f));
    setImages(capped);
    setImagePreviews(newPreviews);
    // Reset input value so same files can be added again if removed
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImages(images.filter((_, i) => i !== idx));
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title || !category || !innovationSummary || !description) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      let fileBlobIds: string[] = [];
      if (images.length > 0) {
        fileBlobIds = await uploadImages(images, setUploadProgress);
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
      // Cleanup previews
      for (const url of imagePreviews) {
        URL.revokeObjectURL(url);
      }
      setImages([]);
      setImagePreviews([]);
      setUploadProgress(0);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-white text-gray-900 sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="upload.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Upload Your Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="up-title" className="text-gray-800 font-medium">
                Project Title *
              </Label>
              <Input
                id="up-title"
                placeholder="My Amazing Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white text-gray-900 border-gray-300"
                data-ocid="upload.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-800 font-medium">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="bg-white text-gray-900 border-gray-300"
                  data-ocid="upload.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900">
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
            <Label htmlFor="up-tags" className="text-gray-800 font-medium">
              Tags (comma-separated)
            </Label>
            <Input
              id="up-tags"
              placeholder="AI, machine learning, robotics"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-white text-gray-900 border-gray-300"
              data-ocid="upload.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="up-summary" className="text-gray-800 font-medium">
              Innovation Summary *
            </Label>
            <Textarea
              id="up-summary"
              placeholder="What makes your project innovative?"
              value={innovationSummary}
              onChange={(e) => setInnovationSummary(e.target.value)}
              rows={2}
              className="bg-white text-gray-900 border-gray-300"
              data-ocid="upload.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="up-desc" className="text-gray-800 font-medium">
              Full Description *
            </Label>
            <Textarea
              id="up-desc"
              placeholder="Describe your project in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-white text-gray-900 border-gray-300"
              data-ocid="upload.textarea"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-800 font-medium">
                Project Images (up to 10)
              </Label>
              <span className="text-xs text-gray-500 font-medium">
                {images.length} / {MAX_IMAGES} images selected
              </span>
            </div>

            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
              data-ocid="upload.dropzone"
            >
              <ImagePlus className="w-7 h-7 mx-auto mb-1.5 text-gray-500" />
              <p className="text-sm text-gray-600 font-medium">
                {images.length >= MAX_IMAGES
                  ? "Maximum images reached"
                  : "Click to add images"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                PNG, JPG, GIF, WEBP accepted
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </button>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={src}
                    className="relative group rounded-lg overflow-hidden border border-gray-200"
                    style={{ height: 80 }}
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-ocid={`upload.delete_button.${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                  data-ocid="upload.loading_state"
                />
              </div>
              <p className="text-xs text-gray-600 text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
              data-ocid="upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
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
