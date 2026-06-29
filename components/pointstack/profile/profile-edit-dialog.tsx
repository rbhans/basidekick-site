"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { TagInput } from "../shared/tag-input";
import { CoverBannerControl } from "./cover-banner-control";
import { PointStackProfile, PointStackAvailabilityStatus } from "@/lib/types";
import {
  profileEditFormSchema,
  type ProfileEditFormValues,
} from "@/lib/schemas/pointstack-company-profile";
import * as api from "../pointstack-api";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PointStackProfile;
  onSave: (updatedProfile: PointStackProfile) => void;
}

const SUGGESTED_SKILLS = [
  "niagara",
  "metasys",
  "bacnet",
  "modbus",
  "hvac",
  "programming",
  "commissioning",
  "graphics",
  "tridium",
  "jci",
  "siemens",
  "honeywell",
  "schneider",
  "alc",
  "ddc",
  "plc",
  "scada",
];

const AVAILABILITY_OPTIONS: { value: PointStackAvailabilityStatus; label: string }[] = [
  { value: "available", label: "Available for work" },
  { value: "busy", label: "Busy" },
  { value: "not-looking", label: "Not looking" },
];

function getDefaultValues(profile: PointStackProfile): ProfileEditFormValues {
  return {
    displayName: profile.display_name || "",
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    skills: profile.skills || [],
    websiteUrl: profile.website_url || "",
    linkedinUrl: profile.linkedin_url || "",
    githubUrl: profile.github_url || "",
    availabilityStatus: profile.availability_status || "not-looking",
    coverImageUrl: profile.cover_image_url || "",
    coverColor: profile.cover_color || "",
  };
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: getDefaultValues(profile),
  });

  useEffect(() => {
    form.reset(getDefaultValues(profile));
  }, [profile, open, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const skills = useWatch({
    control: form.control,
    name: "skills",
    defaultValue: [],
  });

  const coverImageUrl = useWatch({ control: form.control, name: "coverImageUrl", defaultValue: "" });
  const coverColor = useWatch({ control: form.control, name: "coverColor", defaultValue: "" });

  const onSubmit = async (values: ProfileEditFormValues) => {
    setSubmitError(null);

    try {
      const updatedProfile = await api.updateProfile({
        display_name: values.displayName.trim() || undefined,
        headline: values.headline.trim() || undefined,
        bio: values.bio.trim() || undefined,
        location: values.location.trim() || undefined,
        skills: values.skills.length > 0 ? values.skills : undefined,
        website_url: values.websiteUrl.trim() || undefined,
        linkedin_url: values.linkedinUrl.trim() || undefined,
        github_url: values.githubUrl.trim() || undefined,
        availability_status: values.availabilityStatus,
        cover_image_url: values.coverImageUrl.trim() || null,
        cover_color: values.coverColor.trim() || null,
      });

      onSave(updatedProfile);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitError("Failed to update profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="How should we call you?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Niagara Developer at Acme Controls" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      maxLength={500}
                      placeholder="A few sentences about your background, focus areas, and what you're up to."
                      className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans resize-y rounded-md"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {field.value?.length || 0}/500
                  </p>
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
                    <Input placeholder="e.g., Denver, CO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <TagInput
                      value={skills}
                      onChange={field.onChange}
                      placeholder="Add your BAS skills..."
                      maxTags={10}
                      suggestions={SUGGESTED_SKILLS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Availability Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 border-t border-border pt-4">
              <CoverBannerControl
                userId={profile.id}
                coverImageUrl={coverImageUrl}
                coverColor={coverColor}
                onChange={(v) => {
                  form.setValue("coverImageUrl", v.coverImageUrl, { shouldDirty: true });
                  form.setValue("coverColor", v.coverColor, { shouldDirty: true });
                }}
              />
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <h4 className="mb-3 text-sm font-medium">Social Links</h4>

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://yoursite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://github.com/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
