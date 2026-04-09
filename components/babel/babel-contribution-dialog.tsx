"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
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
import {
  Warning,
  Bug,
  PencilSimple,
  Plus,
  CircleNotch,
  Check,
} from "@phosphor-icons/react";
import type { BabelContributionType } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  babelContributionFormSchema,
  type BabelContributionFormValues,
} from "@/lib/schemas/babel";

interface BabelContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: BabelContributionType;
  entryId?: string;
  entryType?: "point" | "equipment";
  entryCategory?: string;
  entryName?: string;
  isAuthenticated: boolean;
}

function getDefaultValues(initialType: BabelContributionType): BabelContributionFormValues {
  return {
    type: initialType,
    title: "",
    description: "",
    suggestedChanges: "",
  };
}

export function BabelContributionDialog({
  open,
  onOpenChange,
  initialType = "edit",
  entryId,
  entryType,
  entryCategory,
  entryName,
  isAuthenticated,
}: BabelContributionDialogProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BabelContributionFormValues>({
    resolver: zodResolver(babelContributionFormSchema),
    defaultValues: getDefaultValues(initialType),
  });

  const resetDialogState = () => {
    form.reset(getDefaultValues(initialType));
    setSubmitError(null);
    setIsSuccess(false);
  };

  useEffect(() => {
    if (open) {
      form.setValue("type", initialType, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [open, initialType, form]);

  const type = useWatch({
    control: form.control,
    name: "type",
    defaultValue: initialType,
  });

  const handleClose = () => {
    resetDialogState();
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: BabelContributionFormValues) => {
    setSubmitError(null);

    const supabase = createClient();
    if (!supabase) {
      setSubmitError("Unable to connect to the database");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError("You must be signed in to submit a contribution");
        return;
      }

      const contribution = {
        user_id: user.id,
        type: values.type,
        entry_id: values.type !== "new_entry" ? entryId : null,
        entry_type: values.type !== "new_entry" ? entryType : null,
        entry_category: values.type !== "new_entry" ? entryCategory : null,
        title: values.title.trim(),
        description: values.description.trim(),
        suggested_changes:
          values.type === "edit" && values.suggestedChanges.trim()
            ? { changes: values.suggestedChanges.trim() }
            : null,
      };

      const { error } = await supabase.from("babel_contributions").insert(contribution);

      if (error) {
        console.error("Insert error:", error);
        setSubmitError("Failed to submit contribution. Please try again.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("An unexpected error occurred");
    }
  };

  const typeOptions: {
    value: BabelContributionType;
    label: string;
    description: string;
    icon: typeof Bug;
  }[] = [
    {
      value: "error",
      label: "Report Error",
      description: "Something is incorrect or misleading",
      icon: Bug,
    },
    {
      value: "edit",
      label: "Suggest Edit",
      description: "Improve existing information",
      icon: PencilSimple,
    },
    {
      value: "new_entry",
      label: "Request New Entry",
      description: "Add a missing point or equipment",
      icon: Plus,
    },
  ];

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Contribute</DialogTitle>
            <DialogDescription>
              You need to be signed in to submit contributions to BAS Atlas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="size-6 text-green-500" weight="bold" />
            </div>
            <DialogTitle className="mb-2">Thank you!</DialogTitle>
            <DialogDescription>
              Your contribution has been submitted and will be reviewed by our team.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contribute to BAS Atlas</DialogTitle>
          <DialogDescription>
            {entryName ? (
              <>
                Help improve the entry for <span className="font-medium text-foreground">{entryName}</span>
              </>
            ) : (
              "Share your knowledge to help grow this open source, community-driven resource"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What would you like to do?</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {typeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.value;

                        if (option.value === "new_entry" && entryId) return null;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={`w-full rounded border p-3 text-left transition-colors ${
                              isSelected
                                ? "border-primary bg-muted"
                                : "border-border hover:border-foreground"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 ${
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <Icon className="size-5" />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                                  {option.label}
                                </p>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>
                    {type === "error"
                      ? "What's wrong?"
                      : type === "edit"
                        ? "What should change?"
                        : "What's missing?"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder={
                        type === "error"
                          ? "e.g., Incorrect unit shown"
                          : type === "edit"
                            ? "e.g., Add more common aliases"
                            : "e.g., Add supply air damper position"
                      }
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
                <FormItem className="space-y-2">
                  <FormLabel>
                    {type === "error"
                      ? "Describe the issue"
                      : type === "edit"
                        ? "Describe your suggestion"
                        : "Describe the new entry"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder={
                        type === "error"
                          ? "Explain what's incorrect and what the correct information should be..."
                          : type === "edit"
                            ? "Explain what should be changed or added..."
                            : "Describe the point or equipment, including any common names or aliases..."
                      }
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "edit" && (
              <FormField
                control={form.control}
                name="suggestedChanges"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Suggested changes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="changes"
                        placeholder="List specific changes, e.g.:&#10;- Add alias: 'ZAT'&#10;- Update description to include..."
                        className="min-h-20 font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {submitError && (
              <div className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <Warning className="size-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <CircleNotch className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Contribution"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
