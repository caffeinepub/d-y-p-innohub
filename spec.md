# D.Y.P.InnoHub

## Current State
The app has an `UploadProjectModal` that allows uploading files (any type) via `fileBlobIds: Array<string>`. The current upload logic in the modal is a fake implementation — it just base64-encodes a few bytes instead of actually uploading to blob storage. The `StorageClient` (in `utils/StorageClient.ts`) handles real blob uploads via `putFile()` returning a sha256 hash, and `getDirectURL(hash)` for retrieval. The `config.ts` already sets up a `StorageClient` internally when creating the actor. The `Project` model stores `fileBlobIds: Array<string>` (blob hashes).

## Requested Changes (Diff)

### Add
- A dedicated image upload section in `UploadProjectModal.tsx` that:
  - Accepts **only image files** (accept="image/*")
  - Enforces a minimum of 1 and maximum of 10 images
  - Shows thumbnail previews of selected images (using `URL.createObjectURL`)
  - Allows removing individual images before submit
  - Actually uploads images to blob storage via `StorageClient.putFile()` and stores resulting hashes in `fileBlobIds`
  - Shows upload progress per image
- A new `useStorageClient` hook (`hooks/useStorageClient.ts`) that creates a `StorageClient` using `loadConfig()` and the user's identity from `useInternetIdentity`
- Image gallery display in `ProjectDetailPage.tsx` — show uploaded images as a scrollable row/grid if `fileBlobIds` exist
- Thumbnail in `ProjectCard.tsx` — show first image as card thumbnail if available

### Modify
- `UploadProjectModal.tsx`: Replace the broken fake upload logic with real blob storage upload using the new `useStorageClient` hook. Rename the section label from "Attachments (images, documents)" to "Project Images (1–10)".
- `ProjectCard.tsx`: Add optional image thumbnail at the top of the card if the project has `fileBlobIds`.
- `ProjectDetailPage.tsx`: Add image gallery section.

### Remove
- The fake `btoa(String.fromCharCode(...blobBytes.slice(0, 32)))` blob ID generation in `UploadProjectModal.tsx`

## Implementation Plan
1. Create `src/frontend/src/hooks/useStorageClient.ts` — exports `uploadImages(files: File[], onProgress?: (pct: number) => void): Promise<string[]>` and `getImageURL(hash: string): Promise<string>` using `StorageClient` from config.
2. Update `UploadProjectModal.tsx` — replace file section with image-only section (1–10 images), show previews, call `uploadImages` on submit.
3. Update `ProjectCard.tsx` — add an `ImageThumbnail` component that calls `getImageURL` for the first hash and renders it.
4. Update `ProjectDetailPage.tsx` — add image gallery that resolves all image hashes to URLs and displays them.
