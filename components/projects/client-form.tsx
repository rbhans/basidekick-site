"use client";

import { useMemo, useState, useRef } from "react";
import { X, Plus, Check, Copy, Upload, Spinner, Image as ImageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "./project-hooks";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { PSKClient, PSKClientContact } from "@/lib/types";

interface ClientFormProps {
  client?: PSKClient;
  onSave: () => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { addClient, updateClient } = useClients();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState(() => ({
    name: client?.name ?? "",
    notes: client?.notes ?? "",
    logo: client?.logo ?? "",
    contacts:
      client?.contacts ??
      ([{ name: "", email: "", phone: "" }] as PSKClientContact[]),
    colorPalette: client?.color_palette ?? [],
  }));

  const [newColor, setNewColor] = useState("#1E1E1E");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const contactsValid = useMemo(
    () => formState.contacts.some((contact) => contact.name.trim().length > 0),
    [formState.contacts]
  );

  const handleAddContact = () => {
    setFormState((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", email: "", phone: "" }],
    }));
  };

  const handleRemoveContact = (index: number) => {
    if (formState.contacts.length === 1) {
      alert("At least one contact is required");
      return;
    }

    setFormState((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateContact = (
    index: number,
    field: keyof PSKClientContact,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, idx) =>
        idx === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const handleAddColor = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      alert("Please use a 6-digit hex value (e.g. #1A1A1A)");
      return;
    }

    setFormState((prev) => ({
      ...prev,
      colorPalette: prev.colorPalette.includes(newColor)
        ? prev.colorPalette
        : [...prev.colorPalette, newColor],
    }));
    setNewColor("#1E1E1E");
  };

  const handleRemoveColor = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      colorPalette: prev.colorPalette.filter((_, idx) => idx !== index),
    }));
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (error) {
      console.error("Failed to copy color", error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, PNG, GIF, WebP, or SVG)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase client not available");

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('psk-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('psk-assets')
        .getPublicUrl(fileName);

      setFormState((prev) => ({ ...prev, logo: publicUrl }));
    } catch (error) {
      console.error("Failed to upload logo:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormState((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      alert("Client name is required");
      return;
    }

    if (!contactsValid) {
      alert("Please provide at least one contact with a name");
      return;
    }

    if (!user?.id) {
      alert("Unable to save - please sign in");
      return;
    }

    const filteredContacts = formState.contacts.filter((contact) =>
      contact.name.trim()
    );

    if (client) {
      await updateClient(client.id, {
        name: formState.name,
        contacts: filteredContacts,
        logo: formState.logo.trim() || null,
        color_palette:
          formState.colorPalette.length > 0 ? formState.colorPalette : null,
        notes: formState.notes || null,
      });
    } else {
      await addClient({
        user_id: user.id,
        name: formState.name,
        contacts: filteredContacts,
        logo: formState.logo.trim() || null,
        color_palette:
          formState.colorPalette.length > 0 ? formState.colorPalette : null,
        notes: formState.notes || null,
      });
    }

    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Client Name *
          </label>
          <Input
            placeholder="Enter client name"
            value={formState.name}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Logo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          {formState.logo ? (
            <div className="flex items-center gap-3 p-3 border border-border bg-muted/50">
              <div className="size-16 border border-border bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formState.logo}
                  alt="Client logo preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Logo uploaded</p>
                <p className="text-xs text-muted-foreground">Click remove to change</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-destructive hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Spinner className="size-8 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="size-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload logo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, GIF, WebP, SVG (max 5MB)
                  </span>
                </>
              )}
            </label>
          )}
          {uploadError && (
            <p className="mt-2 text-sm text-destructive">{uploadError}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <Textarea
            placeholder="Additional context, reference links, or quick notes"
            value={formState.notes}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, notes: event.target.value }))
            }
            rows={3}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Contacts *</h3>
          <Button variant="outline" size="sm" onClick={handleAddContact}>
            <Plus className="mr-1 size-4" />
            Add Contact
          </Button>
        </div>
        <div className="space-y-3">
          {formState.contacts.map((contact, index) => (
            <div key={index} className="space-y-3 border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Contact {index + 1}
                </span>
                {formState.contacts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContact(index)}
                    className="h-7 gap-1 px-2 text-muted-foreground"
                  >
                    <X className="size-3" />
                    Remove
                  </Button>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Name *</label>
                <Input
                  value={contact.name}
                  onChange={(event) =>
                    handleUpdateContact(index, "name", event.target.value)
                  }
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={contact.email ?? ""}
                    onChange={(event) =>
                      handleUpdateContact(index, "email", event.target.value)
                    }
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Phone
                  </label>
                  <Input
                    value={contact.phone ?? ""}
                    onChange={(event) =>
                      handleUpdateContact(index, "phone", event.target.value)
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Brand Colors</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="color"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
            className="h-10 w-16 cursor-pointer border border-border"
          />
          <Input
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
            className="font-mono"
            placeholder="#1A1A1A"
          />
          <Button type="button" onClick={handleAddColor}>
            <Plus className="mr-1 size-4" />
            Add
          </Button>
        </div>

        {formState.colorPalette.length > 0 && (
          <ul className="space-y-2">
            {formState.colorPalette.map((color, index) => (
              <li key={color} className="flex items-center gap-2">
                <span
                  className="h-10 w-10 border border-border"
                  style={{ backgroundColor: color }}
                />
                <code className="flex-1 text-sm">{color}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyColor(color)}
                  aria-label="Copy color"
                >
                  {copiedColor === color ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveColor(index)}
                  aria-label="Remove color"
                >
                  <X className="size-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Client</Button>
      </div>
    </div>
  );
}
