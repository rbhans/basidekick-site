"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { X, Plus, Copy, Spinner, Image as ImageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useClients } from "./project-hooks";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { PSKClient, PSKClientContact } from "@/lib/types";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/schemas/projects";

interface ClientFormProps {
  client?: PSKClient;
  onSave: () => void;
  onCancel: () => void;
}

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

function getDefaultValues(client?: PSKClient): ClientFormValues {
  return {
    name: client?.name ?? "",
    notes: client?.notes ?? "",
    logo: client?.logo ?? "",
    contacts:
      client?.contacts?.length
        ? client.contacts.map((contact) => ({
            name: contact.name ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
          }))
        : [{ name: "", email: "", phone: "" }],
    colorPalette: client?.color_palette ?? [],
  };
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { addClient, updateClient } = useClients();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newColor, setNewColor] = useState("#1E1E1E");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues(client),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const colorPalette = useWatch({
    control: form.control,
    name: "colorPalette",
    defaultValue: [],
  });
  const logo = useWatch({
    control: form.control,
    name: "logo",
    defaultValue: "",
  });

  const handleAddContact = () => {
    append({ name: "", email: "", phone: "" });
  };

  const handleRemoveContact = (index: number) => {
    if (fields.length === 1) {
      toast.error("At least one contact is required");
      return;
    }

    remove(index);
    form.trigger("contacts");
  };

  const handleAddColor = () => {
    if (!hexColorRegex.test(newColor)) {
      toast.error("Please use a 6-digit hex value (e.g. #1A1A1A)");
      return;
    }

    if (!colorPalette.includes(newColor)) {
      form.setValue("colorPalette", [...colorPalette, newColor], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }

    setNewColor("#1E1E1E");
  };

  const handleRemoveColor = (index: number) => {
    form.setValue(
      "colorPalette",
      colorPalette.filter((_, idx) => idx !== index),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast.success("Color copied");
    } catch (error) {
      console.error("Failed to copy color", error);
      toast.error("Failed to copy color");
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, PNG, GIF, WebP, or SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase client not available");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadErrorResult } = await supabase.storage
        .from("psk-assets")
        .upload(fileName, file);

      if (uploadErrorResult) throw uploadErrorResult;

      const {
        data: { publicUrl },
      } = supabase.storage.from("psk-assets").getPublicUrl(fileName);

      form.setValue("logo", publicUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Failed to upload logo:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue("logo", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: ClientFormValues) => {
    if (!user?.id) {
      toast.error("Unable to save - please sign in");
      return;
    }

    const filteredContacts = values.contacts
      .map((contact) => ({
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
      }))
      .filter((contact) => contact.name);

    const payload = {
      name: values.name.trim(),
      contacts: filteredContacts as PSKClientContact[],
      logo: values.logo.trim() || null,
      color_palette: values.colorPalette.length > 0 ? values.colorPalette : null,
      notes: values.notes.trim() || null,
    };

    if (client) {
      await updateClient(client.id, payload);
    } else {
      await addClient({
        user_id: user.id,
        company_id: null,
        ...payload,
      });
    }

    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={() => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                </FormControl>

                {logo ? (
                  <div className="flex items-center gap-3 border border-border bg-muted/50 p-3">
                    <div className="flex size-16 flex-shrink-0 items-center justify-center overflow-hidden border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo}
                        alt="Client logo preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(event) => {
                          (event.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">Logo uploaded</p>
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
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border p-6 transition-colors hover:bg-muted/50"
                  >
                    {isUploading ? (
                      <>
                        <Spinner className="size-8 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="size-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload logo</span>
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG, GIF, WebP, SVG (max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                )}

                {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional context, reference links, or quick notes"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Contacts *</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
              <Plus className="mr-1 size-4" />
              Add Contact
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="space-y-3 border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Contact {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
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

                <FormField
                  control={form.control}
                  name={`contacts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {typeof form.formState.errors.contacts?.message === "string" && (
            <p className="text-sm text-destructive">{form.formState.errors.contacts.message}</p>
          )}
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

          {colorPalette.length > 0 && (
            <ul className="space-y-2">
              {colorPalette.map((colorItem, index) => (
                <li key={`${colorItem}-${index}`} className="flex items-center gap-2">
                  <span
                    className="h-10 w-10 border border-border"
                    style={{ backgroundColor: colorItem }}
                  />
                  <code className="flex-1 text-sm">{colorItem}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyColor(colorItem)}
                    aria-label="Copy color"
                  >
                    <Copy className="size-4 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
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
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save Client
          </Button>
        </div>
      </form>
    </Form>
  );
}
