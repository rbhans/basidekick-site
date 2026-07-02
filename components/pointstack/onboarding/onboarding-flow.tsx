"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "../shared/tag-input";
import {
  onboardingFormSchema,
  type OnboardingFormValues,
} from "@/lib/schemas/pointstack-company-profile";
import * as api from "../pointstack-api";

const STEPS = [
  { id: 1, title: "Profile" },
  { id: 2, title: "Skills" },
  { id: 3, title: "Complete" },
];

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

const defaultValues: OnboardingFormValues = {
  displayName: "",
  headline: "",
  location: "",
  skills: [],
};

const fieldLabelClass =
  "font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground block mb-2";
const inputClass =
  "w-full border border-border bg-card focus:border-foreground transition-colors outline-none px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans";

export function PointStackOnboardingView() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues,
  });

  const skills = useWatch({
    control: form.control,
    name: "skills",
    defaultValue: [],
  });

  const completeOnboarding = async (values: OnboardingFormValues) => {
    setLoading(true);
    setSubmitError(null);

    try {
      await api.updateProfile({
        display_name: values.displayName.trim() || undefined,
        headline: values.headline.trim() || null,
        location: values.location.trim() || null,
        skills: values.skills,
      });
      await api.completeOnboarding();
      setCurrentStep(3);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setSubmitError("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      await form.handleSubmit(completeOnboarding)();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      setLoading(true);
      api
        .completeOnboarding()
        .then(() => {
          router.push(ROUTES.POINTSTACK);
        })
        .catch((error) => {
          console.error("Error skipping onboarding:", error);
          setSubmitError("Failed to complete onboarding. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleFinish = () => {
    router.push(ROUTES.POINTSTACK);
  };

  if (!user) {
    return (
      <section className="container mx-auto max-w-[640px] px-4 sm:px-6 lg:px-16 py-20">
        <div className="pb-5 border-b border-foreground mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            PointStack · Onboarding
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
            Sign in required
          </h1>
          <p className="italic text-[15px] text-muted-foreground mt-3">
            Please sign in to set up your profile.
          </p>
        </div>
        <Link
          href={ROUTES.SIGNIN}
          className="inline-flex items-center gap-1.5 px-5 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
        >
          Sign in →
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-[640px] px-4 sm:px-6 lg:px-16 py-14">
      <div className="mb-10 pb-5 border-b border-foreground">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
          PointStack · Onboarding
        </div>
        <h1 className="font-heading font-semibold text-[28px] md:text-[32px] leading-[1.1] text-foreground">
          Set up your profile
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 border flex items-center justify-center font-mono text-[11px] tabular-nums ${
                    isComplete
                      ? "bg-accent border-foreground text-accent-foreground"
                      : isActive
                      ? "border-foreground bg-card text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5" weight="bold" />
                  ) : (
                    String(step.id).padStart(2, "0")
                  )}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[1.2px] ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 ${
                    isComplete ? "bg-foreground" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          {currentStep === 1 && (
            <>
              <p className="italic text-[16px] text-muted-foreground mb-6 leading-[1.5]">
                Let&apos;s set up your profile so others can find and connect with you.
              </p>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <label className={fieldLabelClass}>Display name</label>
                      <FormControl>
                        <input
                          placeholder="How should we call you?"
                          {...field}
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <label className={fieldLabelClass}>Headline</label>
                      <FormControl>
                        <input
                          placeholder="e.g., Niagara Developer at Acme Controls"
                          {...field}
                          className={inputClass}
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
                    <FormItem>
                      <label className={fieldLabelClass}>Location</label>
                      <FormControl>
                        <input
                          placeholder="e.g., Denver, CO"
                          {...field}
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <p className="italic text-[16px] text-muted-foreground mb-6 leading-[1.5]">
                Add skills to help others find you for projects and questions.
              </p>
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Skills</label>
                    <FormControl>
                      <TagInput
                        value={skills}
                        onChange={field.onChange}
                        placeholder="Add your BAS skills…"
                        maxTags={10}
                        suggestions={SUGGESTED_SKILLS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {currentStep === 3 && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex w-14 h-14 items-center justify-center border border-foreground bg-accent">
                <Check className="w-7 h-7 text-accent-foreground" weight="bold" />
              </div>
              <h2 className="font-heading font-semibold text-[24px] text-foreground mb-2">
                You&apos;re all set
              </h2>
              <p className="italic text-[15px] text-muted-foreground mb-6">
                Your profile is ready. Start exploring the community.
              </p>
              <button
                onClick={handleFinish}
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
              >
                Go to PointStack →
              </button>
            </div>
          )}

          {submitError && (
            <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-destructive">
              {submitError}
            </p>
          )}

          {currentStep < 3 && (
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-foreground">
              <button
                onClick={handleSkip}
                type="button"
                disabled={loading}
                className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving…" : currentStep === 2 ? "Complete" : "Next"} →
              </button>
            </div>
          )}
        </form>
      </Form>
    </section>
  );
}
