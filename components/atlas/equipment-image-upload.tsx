"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { ImageSquare, SpinnerGap } from "@phosphor-icons/react";

interface EquipmentImageUploadProps {
  equipmentId: string;
  onUploaded?: (image: { id: string; url: string }) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function EquipmentImageUpload({ equipmentId, onUploaded }: EquipmentImageUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, GIF, or WebP");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/${equipmentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("equipment-images").getPublicUrl(fileName);

      const { data: imageRow, error: insertError } = await supabase
        .from("equipment_images")
        .insert({
          equipment_id: equipmentId,
          uploaded_by: user.id,
          url: publicUrl,
          storage_path: fileName,
        })
        .select("id, url")
        .single();

      if (insertError) throw insertError;

      if (imageRow && onUploaded) {
        onUploaded({ id: imageRow.id, url: imageRow.url });
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? (
          <SpinnerGap className="w-3 h-3 animate-spin" />
        ) : (
          <ImageSquare className="w-3 h-3" />
        )}
        {isUploading ? "Uploading…" : "+ Add photo"}
      </button>
      {error && (
        <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
