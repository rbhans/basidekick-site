"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useAtlasAll } from "./use-atlas-data";

const PROTOCOLS = ["BACnet", "Modbus", "LON", "N2", "Other"];

export function EquipmentAddForm() {
  const { user } = useAuth();
  const { data } = useAtlasAll();

  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");

  const [typeId, setTypeId] = useState("");
  const [typeName, setTypeName] = useState("");

  const [modelName, setModelName] = useState("");
  const [modelNumbers, setModelNumbers] = useState("");
  const [protocols, setProtocols] = useState<string[]>([]);
  const [status, setStatus] = useState<"current" | "discontinued">("current");
  const [description, setDescription] = useState("");
  const [manufacturerUrl, setManufacturerUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandOptions = useMemo(() => data?.brands || [], [data]);
  const typeOptions = useMemo(() => data?.types || [], [data]);
  const isNewBrand = brandId === "new";
  const isNewType = typeId === "new";

  const uploadFile = async (file: File, folder: string) => {
    const supabase = createClient();
    if (!supabase || !user) throw new Error("Missing auth");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("equipment-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("equipment-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadFile(file, "brand-logos");
      setBrandLogoUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to upload logo.");
    }
  };

  const handleModelImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadFile(file, "model-images");
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to submit equipment.");
      return;
    }

    if (!modelName.trim()) {
      setError("Model name is required.");
      return;
    }

    if (!brandId) {
      setError("Brand is required.");
      return;
    }

    if (isNewBrand && !brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    if (!typeId) {
      setError("Type is required.");
      return;
    }

    if (isNewType && !typeName.trim()) {
      setError("Type name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      const selectedBrand = brandOptions.find((b) => b.id === brandId);
      const selectedType = typeOptions.find((t) => t.id === typeId);

      const payload = {
        user_id: user.id,
        type: "new_entry",
        brand_id: isNewBrand ? null : brandId || null,
        brand_name: isNewBrand ? brandName.trim() : selectedBrand?.name || brandId,
        brand_logo_url: isNewBrand ? (brandLogoUrl || null) : null,
        type_id: isNewType ? null : typeId || null,
        type_name: isNewType ? typeName.trim() : selectedType?.name || typeId,
        model_name: modelName.trim(),
        model_numbers: modelNumbers
          ? modelNumbers.split(",").map((n) => n.trim()).filter(Boolean)
          : [],
        protocols,
        model_status: status,
        description: description.trim() || null,
        manufacturer_url: manufacturerUrl.trim() || null,
        image_url: imageUrl || null,
        review_status: "pending",
      };

      const { error: insertError } = await supabase
        .from("equipment_submissions")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setError("Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setModelName("");
      setModelNumbers("");
      setProtocols([]);
      setDescription("");
      setManufacturerUrl("");
      setImageUrl("");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Sign in to submit new equipment.</p>
        <Button asChild className="mt-4">
          <a href="/signin">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 p-3 text-sm">
          Thanks! Your submission is under review.
        </div>
      )}

      {error && (
        <div className="border border-destructive/30 bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Brand *</Label>
        <select
          className="w-full border border-border bg-background px-3 py-2 text-sm"
          value={brandId}
          onChange={(e) => {
            const value = e.target.value;
            setBrandId(value);
            if (value !== "new") {
              setBrandName("");
              setBrandLogoUrl("");
            }
          }}
        >
          <option value="">Select brand</option>
          {brandOptions.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
          <option value="new">Add new brand</option>
        </select>
      </div>

      {isNewBrand && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Brand Name *</Label>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Brand Logo (optional)</Label>
            <input type="file" accept="image/*" onChange={handleBrandLogoUpload} />
            {brandLogoUrl && <p className="text-xs text-muted-foreground">Logo uploaded</p>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Type *</Label>
        <select
          className="w-full border border-border bg-background px-3 py-2 text-sm"
          value={typeId}
          onChange={(e) => {
            const value = e.target.value;
            setTypeId(value);
            if (value !== "new") {
              setTypeName("");
            }
          }}
        >
          <option value="">Select type</option>
          {typeOptions.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
          <option value="new">Add new type</option>
        </select>
      </div>

      {isNewType && (
        <div className="space-y-2">
          <Label>Type Name *</Label>
          <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} />
        </div>
      )}

      <div className="space-y-2">
        <Label>Model Name *</Label>
        <Input value={modelName} onChange={(e) => setModelName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Model Number(s)</Label>
        <Input value={modelNumbers} onChange={(e) => setModelNumbers(e.target.value)} placeholder="Comma-separated" />
      </div>

      <div className="space-y-2">
        <Label>Protocols</Label>
        <div className="flex flex-wrap gap-3">
          {PROTOCOLS.map((protocol) => (
            <label key={protocol} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={protocols.includes(protocol)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProtocols((prev) => [...prev, protocol]);
                  } else {
                    setProtocols((prev) => prev.filter((p) => p !== protocol));
                  }
                }}
              />
              {protocol}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="current"
              checked={status === "current"}
              onChange={() => setStatus("current")}
            />
            Current
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="discontinued"
              checked={status === "discontinued"}
              onChange={() => setStatus("discontinued")}
            />
            Discontinued
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Manufacturer URL</Label>
        <Input value={manufacturerUrl} onChange={(e) => setManufacturerUrl(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Image (optional)</Label>
        <input type="file" accept="image/*" onChange={handleModelImageUpload} />
        {imageUrl && <p className="text-xs text-muted-foreground">Image uploaded</p>}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit for Review"}
      </Button>
    </form>
  );
}
