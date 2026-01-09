"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/user-avatar";
import { Camera, SpinnerGap, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string | null;
  onAvatarChange: (newUrl: string | null) => void;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB for avatars

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  onAvatarChange,
  className,
}: AvatarUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, GIF, or WebP");
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!user || !currentAvatarUrl) return;

    setIsRemoving(true);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      // Delete from storage
      const path = currentAvatarUrl.split("/avatars/")[1];
      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;

      onAvatarChange(null);
    } catch (err) {
      console.error("Failed to remove avatar:", err);
      setError("Failed to remove. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  if (!user) return null;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading || isRemoving}
      />

      {/* Avatar Preview */}
      <div className="relative group">
        {currentAvatarUrl ? (
          <div className="size-24 rounded-full overflow-hidden bg-muted">
            <Image
              src={currentAvatarUrl}
              alt={displayName || "Avatar"}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <UserAvatar
            name={displayName}
            size="lg"
            className="!size-24 !text-2xl"
          />
        )}

        {/* Hover overlay */}
        <button
          onClick={handleClick}
          disabled={isUploading || isRemoving}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <SpinnerGap className="size-6 text-white animate-spin" />
          ) : (
            <Camera className="size-6 text-white" />
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading || isRemoving}
        >
          {isUploading ? (
            <>
              <SpinnerGap className="size-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="size-4 mr-2" />
              {currentAvatarUrl ? "Change" : "Upload"}
            </>
          )}
        </Button>
        {currentAvatarUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading || isRemoving}
            className="text-destructive hover:text-destructive"
          >
            {isRemoving ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : (
              <Trash className="size-4" />
            )}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF, or WebP. Max 2MB.
      </p>
    </div>
  );
}
