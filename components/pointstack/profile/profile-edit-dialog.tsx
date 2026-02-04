"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { TagInput } from "../shared/tag-input";
import { PointStackProfile, PointStackAvailabilityStatus } from "@/lib/types";
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

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [location, setLocation] = useState(profile.location || "");
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(profile.github_url || "");
  const [availabilityStatus, setAvailabilityStatus] = useState<PointStackAvailabilityStatus>(
    profile.availability_status || "not-looking"
  );

  // Reset form when profile changes
  useEffect(() => {
    setDisplayName(profile.display_name || "");
    setHeadline(profile.headline || "");
    setLocation(profile.location || "");
    setSkills(profile.skills || []);
    setWebsiteUrl(profile.website_url || "");
    setLinkedinUrl(profile.linkedin_url || "");
    setGithubUrl(profile.github_url || "");
    setAvailabilityStatus(profile.availability_status || "not-looking");
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedProfile = await api.updateProfile({
        display_name: displayName || undefined,
        headline: headline || undefined,
        location: location || undefined,
        skills: skills.length > 0 ? skills : undefined,
        website_url: websiteUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        github_url: githubUrl || undefined,
        availability_status: availabilityStatus,
      });
      onSave(updatedProfile);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          <div className="space-y-2">
            <Label>Skills</Label>
            <TagInput
              value={skills}
              onChange={setSkills}
              placeholder="Add your BAS skills..."
              maxTags={10}
              suggestions={SUGGESTED_SKILLS}
            />
          </div>

          <div className="space-y-2">
            <Label>Availability Status</Label>
            <Select
              value={availabilityStatus}
              onValueChange={(value) => setAvailabilityStatus(value as PointStackAvailabilityStatus)}
            >
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
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-medium mb-3">Social Links</h4>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
