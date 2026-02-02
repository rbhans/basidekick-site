"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Wrench,
  Buildings,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "../shared/tag-input";
import { ROUTES } from "@/lib/routes";
import * as api from "../pointstack-api";
import { cn } from "@/lib/utils";

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

export function PointStackOnboardingView() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const handleNext = async () => {
    if (currentStep === 2) {
      // Final step - save and complete
      setLoading(true);
      try {
        await api.updateProfile({
          display_name: displayName || undefined,
          headline: headline || undefined,
          location: location || undefined,
          skills: skills.length > 0 ? skills : undefined,
        });
        await api.completeOnboarding();
        setCurrentStep(3);
      } catch (error) {
        console.error("Error completing onboarding:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      api.completeOnboarding().then(() => {
        router.push(ROUTES.POINTSTACK);
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    router.push(ROUTES.POINTSTACK);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to set up your profile.
          </p>
          <Button asChild>
            <a href={ROUTES.SIGNIN}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2",
                    isComplete ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="border border-border rounded-lg p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to PointStack!</h2>
              <p className="text-muted-foreground">
                Let&apos;s set up your profile so others can find and connect with you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Niagara Developer at Acme Controls"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Denver, CO"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">What are your skills?</h2>
              <p className="text-muted-foreground">
                Add skills to help others find you for projects and questions.
              </p>
            </div>

            <TagInput
              value={skills}
              onChange={setSkills}
              placeholder="Add your BAS skills..."
              maxTags={10}
              suggestions={SUGGESTED_SKILLS}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You&apos;re all set!</h2>
            <p className="text-muted-foreground mb-6">
              Your profile is ready. Start exploring the community!
            </p>
            <Button onClick={handleFinish} size="lg">
              Go to PointStack
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Actions */}
        {currentStep < 3 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading ? "Saving..." : currentStep === 2 ? "Complete" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
