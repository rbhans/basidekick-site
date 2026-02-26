"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  User,
  Wrench,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "../shared/tag-input";
import {
  onboardingFormSchema,
  type OnboardingFormValues,
} from "@/lib/schemas/pointstack-company-profile";
import * as api from "../pointstack-api";

const STEPS = [
  { id: 1, title: "Profile", icon: User },
  { id: 2, title: "Skills", icon: Wrench },
  { id: 3, title: "Complete", icon: Check },
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
        headline: values.headline.trim() || undefined,
        location: values.location.trim() || undefined,
        skills: values.skills.length > 0 ? values.skills : undefined,
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
      <div className="mx-auto max-w-md p-6">
        <div className="py-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">Sign in required</h2>
          <p className="mb-4 text-muted-foreground">Please sign in to set up your profile.</p>
          <Button asChild>
            <a href={ROUTES.SIGNIN}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 md:p-6">
      <div className="mb-8 flex items-center justify-center gap-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-12",
                    isComplete ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/30 bg-card/90 p-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            {currentStep === 1 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="mb-2 text-2xl font-bold">Welcome to PointStack!</h2>
                  <p className="text-muted-foreground">
                    Let&apos;s set up your profile so others can find and connect with you.
                  </p>
                </div>

                <div className="space-y-4">
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
                          <Input
                            placeholder="e.g., Niagara Developer at Acme Controls"
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
                          <Input placeholder="e.g., Denver, CO" {...field} />
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
                <div className="mb-6 text-center">
                  <h2 className="mb-2 text-2xl font-bold">What are your skills?</h2>
                  <p className="text-muted-foreground">
                    Add skills to help others find you for projects and questions.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
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
              </>
            )}

            {currentStep === 3 && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">You&apos;re all set!</h2>
                <p className="mb-6 text-muted-foreground">
                  Your profile is ready. Start exploring the community!
                </p>
                <Button onClick={handleFinish} size="lg" type="button">
                  Go to PointStack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            {currentStep < 3 && (
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <Button variant="ghost" onClick={handleSkip} type="button" disabled={loading}>
                  Skip for now
                </Button>
                <Button onClick={handleNext} disabled={loading} type="button">
                  {loading ? "Saving..." : currentStep === 2 ? "Complete" : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
