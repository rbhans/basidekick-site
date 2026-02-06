"use client";

import { ReactNode, useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  CreatePointStackJobInput,
  PointStackCompany,
  PointStackExperienceLevel,
  PointStackJob,
  PointStackJobType,
} from "@/lib/types";
import { validateContent, validateTitle } from "@/lib/security";
import * as api from "../pointstack-api";

interface CreateJobDialogProps {
  trigger: ReactNode;
  onCreated?: (job: PointStackJob) => void | Promise<void>;
}

const JOB_TYPES: PointStackJobType[] = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
];

const EXPERIENCE_LEVELS: PointStackExperienceLevel[] = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
];

const NONE = "__none__";

export function CreateJobDialog({ trigger, onCreated }: CreateJobDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jobType, setJobType] = useState<PointStackJobType>("full-time");
  const [experienceLevel, setExperienceLevel] = useState<string>(NONE);
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [companyId, setCompanyId] = useState<string>(NONE);

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
    setTitle("");
    setDescription("");
    setRequirements("");
    setJobType("full-time");
    setExperienceLevel(NONE);
    setLocation("");
    setIsRemote(false);
    setSalaryMin("");
    setSalaryMax("");
    setApplicationUrl("");
    setApplicationEmail("");
    setCompanyId(NONE);
    setError(null);
  };

  const validateOptionalUrl = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateOptionalEmail = (value: string): boolean => {
    if (!value.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Job title is required.");
      return;
    }
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setError(titleValidation.error || "Invalid title.");
      return;
    }
    if (!description.trim()) {
      setError("Job description is required.");
      return;
    }
    const descriptionValidation = validateContent(description);
    if (!descriptionValidation.valid) {
      setError(descriptionValidation.error || "Invalid description.");
      return;
    }
    if (requirements.trim()) {
      const requirementsValidation = validateContent(requirements);
      if (!requirementsValidation.valid) {
        setError(requirementsValidation.error || "Invalid requirements.");
        return;
      }
    }
    if (!applicationUrl.trim() && !applicationEmail.trim()) {
      setError("Provide either an application URL or application email.");
      return;
    }
    if (!validateOptionalUrl(applicationUrl)) {
      setError("Application URL must be a valid http/https URL.");
      return;
    }
    if (!validateOptionalEmail(applicationEmail)) {
      setError("Application email is invalid.");
      return;
    }

    const parsedSalaryMin = salaryMin.trim() ? Number(salaryMin) : undefined;
    const parsedSalaryMax = salaryMax.trim() ? Number(salaryMax) : undefined;

    if (
      (parsedSalaryMin !== undefined && Number.isNaN(parsedSalaryMin)) ||
      (parsedSalaryMax !== undefined && Number.isNaN(parsedSalaryMax))
    ) {
      setError("Salary fields must be valid numbers.");
      return;
    }
    if (parsedSalaryMin !== undefined && parsedSalaryMin < 0) {
      setError("Salary minimum cannot be negative.");
      return;
    }
    if (parsedSalaryMax !== undefined && parsedSalaryMax < 0) {
      setError("Salary maximum cannot be negative.");
      return;
    }
    if (
      parsedSalaryMin !== undefined &&
      parsedSalaryMax !== undefined &&
      parsedSalaryMin > parsedSalaryMax
    ) {
      setError("Salary minimum cannot be greater than salary maximum.");
      return;
    }

    const input: CreatePointStackJobInput = {
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim() || undefined,
      job_type: jobType,
      experience_level: experienceLevel === NONE ? undefined : (experienceLevel as PointStackExperienceLevel),
      location: location.trim() || undefined,
      is_remote: isRemote,
      salary_min: parsedSalaryMin,
      salary_max: parsedSalaryMax,
      application_url: applicationUrl.trim() || undefined,
      application_email: applicationEmail.trim() || undefined,
      company_id: companyId === NONE ? undefined : companyId,
    };

    setSubmitting(true);
    try {
      const job = await api.createJob(input);
      if (onCreated) {
        await onCreated(job);
      }
      setOpen(false);
      resetForm();
    } catch (submitError) {
      console.error("Error creating job:", submitError);
      setError("Failed to create job. Please try again.");
    } finally {
      setSubmitting(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Title</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Senior BAS Controls Engineer"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the role, team, and day-to-day expectations..."
              rows={6}
              maxLength={50000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-requirements">Requirements (Optional)</Label>
            <Textarea
              id="job-requirements"
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              placeholder="List required experience, certifications, tools..."
              rows={4}
              maxLength={50000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={jobType} onValueChange={(value) => setJobType(value as PointStackJobType)}>
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
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not specified</SelectItem>
                  {EXPERIENCE_LEVELS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-location">Location (Optional)</Label>
              <Input
                id="job-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Austin, TX"
                maxLength={140}
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                id="job-remote"
                type="checkbox"
                checked={isRemote}
                onChange={(event) => setIsRemote(event.target.checked)}
                className="size-4"
              />
              <Label htmlFor="job-remote">Remote-friendly</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-salary-min">Salary Min (Optional)</Label>
              <Input
                id="job-salary-min"
                type="number"
                min={0}
                step={1}
                value={salaryMin}
                onChange={(event) => setSalaryMin(event.target.value)}
                placeholder="80000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-salary-max">Salary Max (Optional)</Label>
              <Input
                id="job-salary-max"
                type="number"
                min={0}
                step={1}
                value={salaryMax}
                onChange={(event) => setSalaryMax(event.target.value)}
                placeholder="120000"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-application-url">Application URL</Label>
              <Input
                id="job-application-url"
                type="url"
                value={applicationUrl}
                onChange={(event) => setApplicationUrl(event.target.value)}
                placeholder="https://company.com/careers/job-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-application-email">Application Email</Label>
              <Input
                id="job-application-email"
                type="email"
                value={applicationEmail}
                onChange={(event) => setApplicationEmail(event.target.value)}
                placeholder="jobs@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company (Optional)</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="No company association" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No company</SelectItem>
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
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim() || !description.trim()}>
              {submitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
