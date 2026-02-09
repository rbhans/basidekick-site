"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Buildings } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PointStackCompany } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createCompanyFormSchema,
  type CreateCompanyFormValues,
} from "@/lib/schemas/pointstack-company-profile";
import * as api from "../pointstack-api";

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (company: PointStackCompany) => void | Promise<void>;
}

const defaultValues: CreateCompanyFormValues = {
  name: "",
  description: "",
};

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompanyDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanyFormSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setSubmitError(null);
  };

  const closeDialog = () => {
    resetForm();
    onOpenChange(false);
  };

  const onSubmit = async (values: CreateCompanyFormValues) => {
    setSubmitError(null);

    try {
      const company = await api.createCompany(
        values.name.trim(),
        values.description.trim() || undefined
      );

      if (onSuccess) {
        await onSuccess(company);
      }

      closeDialog();
    } catch (error) {
      console.error("Failed to create company:", error);
      setSubmitError("Failed to create company. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Buildings className="size-5" />
            Create Company
          </DialogTitle>
          <DialogDescription>
            Create a company profile for your team in the PointStack community.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      maxLength={120}
                      autoFocus
                      {...field}
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
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell the community what your company does"
                      rows={4}
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
