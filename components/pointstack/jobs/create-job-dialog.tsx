"use client";

import { ReactNode, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Buildings } from "@phosphor-icons/react";
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
import { useAuth } from "@/hooks/use-auth";
import {
  createJobFormSchema,
  CreateJobFormValues,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  NONE_OPTION,
} from "@/lib/schemas/pointstack-jobs";
import {
  CreatePointStackJobInput,
  PointStackCompany,
  PointStackExperienceLevel,
  PointStackJob,
} from "@/lib/types";
import * as api from "../pointstack-api";

interface CreateJobDialogProps {
  trigger: ReactNode;
  onCreated?: (job: PointStackJob) => void | Promise<void>;
}

const defaultValues: CreateJobFormValues = {
  title: "",
  description: "",
  requirements: "",
  jobType: "full-time",
  experienceLevel: NONE_OPTION,
  location: "",
  isRemote: false,
  salaryMin: "",
  salaryMax: "",
  applicationUrl: "",
  applicationEmail: "",
  companyId: NONE_OPTION,
};

export function CreateJobDialog({ trigger, onCreated }: CreateJobDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user || !open) return;
      try {
        const data = await api.fetchUserCompanies(user.id);
        setCompanies(data);
      } catch (fetchError) {
        console.error("Error loading companies for job posting:", fetchError);
      }
    };

    void fetchCompanies();
  }, [user, open]);

  const resetForm = () => {
    form.reset(defaultValues);
    setSubmitError(null);
  };

  const onSubmit = async (values: CreateJobFormValues) => {
    setSubmitError(null);

    const parsedSalaryMin = values.salaryMin.trim()
      ? Number(values.salaryMin.trim())
      : undefined;
    const parsedSalaryMax = values.salaryMax.trim()
      ? Number(values.salaryMax.trim())
      : undefined;

    const input: CreatePointStackJobInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      requirements: values.requirements.trim() || undefined,
      job_type: values.jobType,
      experience_level:
        values.experienceLevel === NONE_OPTION
          ? undefined
          : (values.experienceLevel as PointStackExperienceLevel),
      location: values.location.trim() || undefined,
      is_remote: values.isRemote,
      salary_min: parsedSalaryMin,
      salary_max: parsedSalaryMax,
      application_url: values.applicationUrl.trim() || undefined,
      application_email: values.applicationEmail.trim() || undefined,
      company_id: values.companyId === NONE_OPTION ? undefined : values.companyId,
    };

    try {
      const job = await api.createJob(input);
      if (onCreated) {
        await onCreated(job);
      }
      setOpen(false);
      resetForm();
    } catch (submitError) {
      console.error("Error creating job:", submitError);
      setSubmitError("Failed to create job. Please try again.");
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Job</DialogTitle>
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
                      id="job-title"
                      placeholder="Senior BAS Controls Engineer"
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="job-description"
                      placeholder="Describe the role, team, and day-to-day expectations..."
                      rows={6}
                      maxLength={50000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="job-requirements"
                      placeholder="List required experience, certifications, tools..."
                      rows={4}
                      maxLength={50000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value.replace("-", " ")}
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
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Experience Level</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_OPTION}>Not specified</SelectItem>
                          {EXPERIENCE_LEVELS.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="job-location"
                        placeholder="Austin, TX"
                        maxLength={140}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pt-8">
                    <FormControl>
                      <input
                        id="job-remote"
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="size-4"
                      />
                    </FormControl>
                    <FormLabel htmlFor="job-remote">Remote-friendly</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Salary Min (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="job-salary-min"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="80000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Salary Max (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="job-salary-max"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="120000"
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
                name="applicationUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Application URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="job-application-url"
                        type="url"
                        placeholder="https://company.com/careers/job-id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationEmail"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Application Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="job-application-email"
                        type="email"
                        placeholder="jobs@company.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Company (Optional)</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="No company association" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION}>No company</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <span className="inline-flex items-center gap-2">
                              <Buildings className="w-4 h-4" />
                              {company.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                {form.formState.isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
