"use client";

import { useRef, useState } from "react";
import { UploadSimple, Trash, SpinnerGap } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface CoverBannerControlProps {
  userId: string;
  coverImageUrl: string;
  coverColor: string;
  onChange: (next: { coverImageUrl: string; coverColor: string }) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB for banners

// Dark, on-brand presets that keep the light banner text readable.
const COLOR_PRESETS = ["#0d0d0d", "#1a1a1a", "#2a1115", "#11212e", "#13241f", "#241225"];

const WATERMARK_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(245,245,245,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,245,.05) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  maskImage: "linear-gradient(90deg, #000 0%, transparent 70%)",
  WebkitMaskImage: "linear-gradient(90deg, #000 0%, transparent 70%)",
};

const SCRIM = "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.3))";

export function CoverBannerControl({ userId, coverImageUrl, coverColor, onChange }: CoverBannerControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImage = Boolean(coverImageUrl);

  const bandStyle: React.CSSProperties = hasImage
    ? { backgroundImage: `url("${coverImageUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : coverColor
    ? { backgroundColor: coverColor }
    : {};

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, GIF, or WebP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 4MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${userId}/cover-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      onChange({ coverImageUrl: publicUrl, coverColor });
    } catch (err) {
      console.error("Failed to upload banner:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => onChange({ coverImageUrl: "", coverColor });
  const pickColor = (color: string) => onChange({ coverImageUrl, coverColor: color });

  return (
    <div className="space-y-3">
      <label className="text-[13px] font-medium text-foreground">Cover banner</label>

      {/* Live preview */}
      <div
        className={`relative h-24 overflow-hidden rounded-md border border-input ${
          !hasImage && !coverColor ? "bg-char" : ""
        }`}
        style={bandStyle}
      >
        {!hasImage && <div aria-hidden className="absolute inset-0" style={WATERMARK_STYLE} />}
        {(hasImage || coverColor) && <div aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />}
        <span className="relative z-[1] m-3 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-cream-2">
          {hasImage ? "Image banner" : coverColor ? "Color banner" : "Default banner"}
        </span>
      </div>

      {/* Image controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-[12.5px] text-foreground transition-colors hover:border-foreground disabled:opacity-60"
        >
          {uploading ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <UploadSimple className="h-4 w-4" />}
          {uploading ? "Uploading…" : hasImage ? "Replace image" : "Upload image"}
        </button>
        {hasImage && (
          <button
            type="button"
            onClick={removeImage}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-[12.5px] text-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4" /> Remove
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Color controls (used when no image is set) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {hasImage ? "Color (when no image)" : "Color"}
        </span>
        <button
          type="button"
          onClick={() => pickColor("")}
          aria-label="Default banner color"
          className={`h-6 w-6 rounded-sm border bg-char ${coverColor === "" ? "ring-2 ring-foreground ring-offset-1" : "border-input"}`}
        />
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pickColor(c)}
            aria-label={`Banner color ${c}`}
            style={{ backgroundColor: c }}
            className={`h-6 w-6 rounded-sm border ${coverColor === c ? "ring-2 ring-foreground ring-offset-1" : "border-input"}`}
          />
        ))}
        <label className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-sm border border-input px-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <input
            type="color"
            value={/^#([0-9a-fA-F]{6})$/.test(coverColor) ? coverColor : "#0d0d0d"}
            onChange={(e) => pickColor(e.target.value)}
            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
          />
          Custom
        </label>
      </div>

      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
