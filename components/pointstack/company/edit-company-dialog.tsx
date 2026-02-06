"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PointStackCompany } from "@/lib/types";
import * as api from "../pointstack-api";

interface EditCompanyDialogProps {
  company: PointStackCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (company: PointStackCompany) => void | Promise<void>;
}

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
const NONE = "__none__";

export function EditCompanyDialog({
  company,
  open,
  onOpenChange,
  onSaved,
}: EditCompanyDialogProps) {
  const { user } = useAuth();

  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(company.website_url || "");
  const [location, setLocation] = useState(company.location || "");
  const [sizeRange, setSizeRange] = useState<string>(company.size_range || NONE);
  const [industry, setIndustry] = useState(company.industry || "");
  const [logoUrl, setLogoUrl] = useState(company.logo_url || "");

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(company.name);
    setDescription(company.description || "");
    setWebsiteUrl(company.website_url || "");
    setLocation(company.location || "");
    setSizeRange(company.size_range || NONE);
    setIndustry(company.industry || "");
    setLogoUrl(company.logo_url || "");
    setError(null);
  }, [company, open]);

  const validateOptionalUrl = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Logo must be an image (JPG, PNG, GIF, WebP, SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be 5MB or smaller.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Upload service unavailable.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
      const fileName = `${user.id}/companies/${company.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("pointstack-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("pointstack-images").getPublicUrl(fileName);
      setLogoUrl(data.publicUrl);
    } catch (uploadErr) {
      console.error("Error uploading company logo:", uploadErr);
      setError("Failed to upload logo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!validateOptionalUrl(websiteUrl)) {
      setError("Website URL must be a valid http/https URL.");
      return;
    }
    if (!validateOptionalUrl(logoUrl)) {
      setError("Logo URL must be a valid http/https URL.");
      return;
    }

    setSubmitting(true);
    try {
      const updatedCompany = await api.updateCompany(company.id, {
        name: name.trim(),
        description: description.trim() || null,
        website_url: websiteUrl.trim() || null,
        location: location.trim() || null,
        size_range: sizeRange === NONE ? null : (sizeRange as "1-10" | "11-50" | "51-200" | "201-500" | "500+"),
        industry: industry.trim() || null,
        logo_url: logoUrl.trim() || null,
      });

      if (onSaved) {
        await onSaved(updatedCompany);
      }

      onOpenChange(false);
    } catch (submitError) {
      console.error("Error updating company:", submitError);
      setError("Failed to save company details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Name</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description">Description</Label>
            <Textarea
              id="company-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input
                id="company-website"
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-location">Location</Label>
              <Input
                id="company-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, State"
                maxLength={140}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={sizeRange} onValueChange={setSizeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not specified</SelectItem>
                  {SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="Building automation"
                maxLength={120}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-logo-url">Logo URL</Label>
            <Input
              id="company-logo-url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://..."
            />
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-16 w-16 rounded-md object-cover border border-border"
              />
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting || uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploading || !name.trim()}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
