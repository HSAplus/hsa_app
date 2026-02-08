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
  Plus,
} from "lucide-react";

interface FileUploadProps {
  /** The storage folder path inside the bucket, e.g. "eob" or "receipts" */
  folder: string;
  /** Current file URLs (already uploaded) */
  value: string[];
  /** Called with the updated URL array after upload or remove */
  onChange: (urls: string[]) => void;
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

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Not authenticated");
          return;
        }

        const safeName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .substring(0, 50);
        const fileName = `${user.id}/${folder}/${Date.now()}-${safeName}`;

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

        const {
          data: { publicUrl },
        } = supabase.storage.from("hsa-documents").getPublicUrl(fileName);

        onChange([...value, publicUrl]);
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange, value]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
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

  const handleRemove = async (url: string) => {
    try {
      const supabase = createClient();
      const parsed = new URL(url);
      const pathMatch = parsed.pathname.match(/\/object\/public\/hsa-documents\/(.+)/);
      if (pathMatch) {
        await supabase.storage.from("hsa-documents").remove([pathMatch[1]]);
      }
    } catch {
      // Silently fail
    }

    onChange(value.filter((u) => u !== url));
  };

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes(".pdf"))
      return <FileText className="h-4 w-4 text-red-500" />;
    if (/\.(jpg|jpeg|png|webp|gif|heic)/i.test(url))
      return <ImageIcon className="h-4 w-4 text-purple-500" />;
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      const raw = parts[parts.length - 1];
      const withoutTs = raw.replace(/^\d+-/, "");
      return decodeURIComponent(withoutTs).replace(/_/g, " ");
    } catch {
      return "Document";
    }
  };

  const hasFiles = value.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">
          {label}
          {required && value.length === 0 && (
            <span className="text-amber-500 ml-1">⚠️</span>
          )}
          {hasFiles && (
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              {value.length} file{value.length !== 1 ? "s" : ""}
            </span>
          )}
        </label>
      </div>
      {description && !hasFiles && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Uploaded files list */}
      {hasFiles && (
        <div className="space-y-1.5">
          {value.map((url) => (
            <div
              key={url}
              className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2.5"
            >
              <div className="shrink-0 rounded-md bg-background p-1.5 border">
                {getFileIcon(url)}
              </div>
              <p className="flex-1 min-w-0 text-sm font-medium truncate">
                {getFileName(url)}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(url)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — always visible so users can add more */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
          ${hasFiles ? "p-3" : "p-4"} cursor-pointer transition-colors
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
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : hasFiles ? (
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-emerald-600">Add another file</span>
            </p>
          </div>
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
