"use client";

import { ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  CreatePointStackResourceInput,
  PointStackResourceListing,
} from "@/lib/types";
import {
  createResourceFormSchema,
  CreateResourceFormValues,
  RESOURCE_CATEGORIES,
} from "@/lib/schemas/pointstack-content";
import * as api from "../pointstack-api";

interface CreateResourceDialogProps {
  trigger: ReactNode;
  onCreated?: (resource: PointStackResourceListing) => void | Promise<void>;
}

const CATEGORY_LABELS: Record<(typeof RESOURCE_CATEGORIES)[number], string> = {
  template: "Template",
  script: "Script",
  document: "Document",
  guide: "Guide",
  tool: "Tool",
  other: "Other",
};

const defaultValues: CreateResourceFormValues = {
  title: "",
  description: "",
  category: "template",
  fileUrl: "",
  externalLink: "",
  isFree: true,
};

export function CreateResourceDialog({ trigger, onCreated }: CreateResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceFormSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setSubmitError(null);
  };

  const onSubmit = async (values: CreateResourceFormValues) => {
    setSubmitError(null);

    const input: CreatePointStackResourceInput = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      category: values.category,
      file_url: values.fileUrl.trim() || undefined,
      external_link: values.externalLink.trim() || undefined,
      is_free: values.isFree,
    };

    try {
      const resource = await api.createResource(input);
      if (onCreated) {
        await onCreated(resource);
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating resource:", error);
      setSubmitError("Failed to share resource. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Resource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="resource-title"
                      placeholder="BACnet Startup Script Template"
                      maxLength={200}
                    />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="resource-description"
                      placeholder="Describe what this resource is and how to use it..."
                      rows={4}
                      maxLength={10000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOURCE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
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
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pt-8">
                    <FormControl>
                      <input
                        id="resource-free"
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="size-4"
                      />
                    </FormControl>
                    <FormLabel htmlFor="resource-free">Free resource</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="resource-file-url"
                      type="url"
                      placeholder="https://example.com/files/template.zip"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>External Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="resource-external-link"
                      type="url"
                      placeholder="https://github.com/user/bas-tools"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Provide a file URL, an external link, or both.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sharing..." : "Share Resource"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
