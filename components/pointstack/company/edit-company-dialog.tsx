"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PointStackCompany, PointStackCompanySizeRange } from "@/lib/types";
import {
  COMPANY_SIZE_NONE,
  COMPANY_SIZE_OPTIONS,
  editCompanyFormSchema,
  type EditCompanyFormValues,
} from "@/lib/schemas/pointstack-company-profile";
import * as api from "../pointstack-api";

interface EditCompanyDialogProps {
  company: PointStackCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (company: PointStackCompany) => void | Promise<void>;
}

function getDefaultValues(company: PointStackCompany): EditCompanyFormValues {
  return {
    name: company.name,
    description: company.description || "",
    websiteUrl: company.website_url || "",
    location: company.location || "",
    sizeRange: company.size_range || COMPANY_SIZE_NONE,
    industry: company.industry || "",
    logoUrl: company.logo_url || "",
  };
}

export function EditCompanyDialog({
  company,
  open,
  onOpenChange,
  onSaved,
}: EditCompanyDialogProps) {
  const { user } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EditCompanyFormValues>({
    resolver: zodResolver(editCompanyFormSchema),
    defaultValues: getDefaultValues(company),
  });

  useEffect(() => {
    form.reset(getDefaultValues(company));
    setSubmitError(null);
  }, [company, open, form]);

  const logoUrl = useWatch({
    control: form.control,
    name: "logoUrl",
    defaultValue: "",
  });
  const companyName = useWatch({
    control: form.control,
    name: "name",
    defaultValue: company.name,
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Logo must be an image (JPG, PNG, GIF, WebP, SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Logo must be 5MB or smaller.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setSubmitError("Upload service unavailable.");
      return;
    }

    setUploading(true);
    setSubmitError(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "dat";
      const fileName = `${user.id}/companies/${company.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("pointstack-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("pointstack-images").getPublicUrl(fileName);
      form.setValue("logoUrl", data.publicUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error uploading company logo:", error);
      setSubmitError("Failed to upload logo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (values: EditCompanyFormValues) => {
    setSubmitError(null);

    try {
      const updatedCompany = await api.updateCompany(company.id, {
        name: values.name.trim(),
        description: values.description.trim() || null,
        website_url: values.websiteUrl.trim() || null,
        location: values.location.trim() || null,
        size_range:
          values.sizeRange === COMPANY_SIZE_NONE
            ? null
            : (values.sizeRange as PointStackCompanySizeRange),
        industry: values.industry.trim() || null,
        logo_url: values.logoUrl.trim() || null,
      });

      if (onSaved) {
        await onSaved(updatedCompany);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating company:", error);
      setSubmitError("Failed to save company details.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input id="company-name" maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea id="company-description" rows={4} maxLength={2000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        id="company-website"
                        type="url"
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        id="company-location"
                        placeholder="City, State"
                        maxLength={140}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sizeRange"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={COMPANY_SIZE_NONE}>Not specified</SelectItem>
                          {COMPANY_SIZE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        id="company-industry"
                        placeholder="Building automation"
                        maxLength={120}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input id="company-logo-url" placeholder="https://..." {...field} />
                  </FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={`${companyName || "Company"} logo`}
                      className="h-16 w-16 rounded-md border border-border object-cover"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting || uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
