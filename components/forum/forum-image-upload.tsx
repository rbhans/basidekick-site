"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ImageSquare, SpinnerGap } from "@phosphor-icons/react";

interface ForumImageUploadProps {
  onImageUploaded: (markdownImage: string) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ForumImageUpload({
  onImageUploaded,
  disabled = false,
}: ForumImageUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, GIF, or WebP");
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      // Generate unique filename: {user_id}/{timestamp}-{random}.{ext}
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("forum-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("forum-assets").getPublicUrl(fileName);

      // Return markdown image syntax
      const altText = file.name.replace(/\.[^/.]+$/, ""); // filename without extension
      onImageUploaded(`![${altText}](${publicUrl})`);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!user) return null;

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="text-muted-foreground hover:text-foreground"
      >
        {isUploading ? (
          <SpinnerGap className="size-4 animate-spin" />
        ) : (
          <ImageSquare className="size-4" />
        )}
        <span className="ml-1 text-xs">
          {isUploading ? "Uploading..." : "Add Image"}
        </span>
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
