"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  FileText,
  Loader2,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

interface FileUploadProps {
  /** The storage folder path inside the bucket, e.g. "eob" or "receipts" */
  folder: string;
  /** Current file URL (if already uploaded) */
  value: string | null;
  /** Called with the public URL after upload, or null on remove */
  onChange: (url: string | null) => void;
  /** Label shown above the upload area */
  label: string;
  /** Optional helper text */
  description?: string;
  /** Accepted file types */
  accept?: string;
  /** Whether this field is required for audit readiness */
  required?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function FileUpload({
  folder,
  value,
  onChange,
  label,
  description,
  accept = "image/*,.pdf,.jpg,.jpeg,.png,.webp,.heic",
  required = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 10 MB.");
        return;
      }

      setUploading(true);

      try {
        const supabase = createClient();

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Not authenticated");
          return;
        }

        // Build path: userId/folder/timestamp-filename
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        const safeName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .substring(0, 50);
        const fileName = `${user.id}/${folder}/${Date.now()}-${safeName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("hsa-documents")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setError(uploadError.message);
          return;
        }

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("hsa-documents").getPublicUrl(fileName);

        onChange(publicUrl);
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemove = async () => {
    if (!value) return;

    // Try to delete from storage (best-effort)
    try {
      const supabase = createClient();
      // Extract the file path from the URL
      const url = new URL(value);
      const pathMatch = url.pathname.match(/\/object\/public\/hsa-documents\/(.+)/);
      if (pathMatch) {
        await supabase.storage.from("hsa-documents").remove([pathMatch[1]]);
      }
    } catch {
      // Silently fail — file may have been moved or deleted already
    }

    onChange(null);
  };

  // Determine file type from URL for icon
  const isPdf = value?.toLowerCase().includes(".pdf");
  const isImage =
    value &&
    /\.(jpg|jpeg|png|webp|gif|heic)/.test(value.toLowerCase());

  // If a file is already uploaded, show the preview/link
  if (value) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none">
            {label}
            {required && (
              <span className="text-amber-500 ml-1">⚠️</span>
            )}
          </label>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <div className="shrink-0 rounded-md bg-background p-2 border">
            {isImage ? (
              <ImageIcon className="h-5 w-5 text-purple-500" />
            ) : isPdf ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {folder.charAt(0).toUpperCase() + folder.slice(1)} document
            </p>
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Upload area (drag & drop or click)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">
          {label}
          {required && (
            <span className="text-amber-500 ml-1">⚠️</span>
          )}
        </label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
          p-4 cursor-pointer transition-colors
          ${dragActive
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
          }
          ${error ? "border-destructive/50" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-emerald-600">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, or HEIC up to 10 MB
              </p>
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
