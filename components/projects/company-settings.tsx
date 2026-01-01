"use client";

import { useState, useEffect } from "react";
import {
  Buildings,
  Copy,
  Check,
  Trash,
  ArrowsClockwise,
  SignOut,
  Crown,
  User,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { useProjectStore } from "./project-store";
import * as companyApi from "./company-api";
import type { PSKCompany, PSKCompanyMember } from "@/lib/types";

interface CompanySettingsProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanySettings({
  companyId,
  open,
  onOpenChange,
}: CompanySettingsProps) {
  const { user } = useAuth();
  const { companies, deleteCompany, setWorkspace, initializeCompanies } = useProjectStore();

  const [company, setCompany] = useState<PSKCompany | null>(null);
  const [members, setMembers] = useState<PSKCompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<PSKCompanyMember | null>(null);

  const isOwner = company?.owner_id === user?.id;

  // Load company and members
  useEffect(() => {
    async function loadData() {
      if (!open || !companyId) return;

      setIsLoading(true);
      try {
        const [companyData, membersData] = await Promise.all([
          companyApi.getCompany(companyId),
          companyApi.getCompanyMembers(companyId),
        ]);
        setCompany(companyData);
        setMembers(membersData);
      } catch (error) {
        console.error("Failed to load company settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [open, companyId]);

  const inviteUrl = company?.invite_code
    ? companyApi.generateInviteUrl(company.invite_code)
    : "";

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRegenerateCode = async () => {
    if (!company) return;

    setIsRegenerating(true);
    try {
      const newCode = await companyApi.regenerateInviteCode(company.id);
      setCompany({ ...company, invite_code: newCode });
    } catch (error) {
      console.error("Failed to regenerate code:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !company) return;

    try {
      await companyApi.removeMember(company.id, memberToRemove.user_id);
      setMembers(members.filter((m) => m.id !== memberToRemove.id));
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleLeaveCompany = async () => {
    if (!company) return;

    try {
      await companyApi.leaveCompany(company.id);
      // Switch to personal workspace
      await setWorkspace({
        type: "personal",
        companyId: null,
        companyName: null,
      });
      await initializeCompanies();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to leave company:", error);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;

    try {
      await deleteCompany(company.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete company:", error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <ArrowsClockwise className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Buildings className="size-5" />
              {company.name}
            </DialogTitle>
            <DialogDescription>
              {isOwner
                ? "Manage your company settings and team members."
                : "View company details and team members."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Invite Link Section */}
            {isOwner && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Invite Link</h3>
                <p className="text-xs text-muted-foreground">
                  Share this link to invite others to join your company.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyInviteLink}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRegenerateCode}
                    disabled={isRegenerating}
                    title="Regenerate invite code"
                  >
                    <ArrowsClockwise
                      className={`size-4 ${isRegenerating ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Members Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                Members ({members.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      {member.role === "owner" ? (
                        <Crown className="size-4 text-yellow-500" />
                      ) : (
                        <User className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">
                        {member.profile?.display_name || "Unknown User"}
                      </span>
                      {member.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </div>
                    {isOwner &&
                      member.user_id !== user?.id &&
                      member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-destructive hover:text-destructive"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash className="size-3.5" />
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-destructive">
                Danger Zone
              </h3>
              {isOwner ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  <Trash className="size-4 mr-2" />
                  Delete Company
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLeaveCompany}
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                >
                  <SignOut className="size-4 mr-2" />
                  Leave Company
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.profile?.display_name || "this member"}</strong>{" "}
              from the company? They will lose access to all shared projects and
              clients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>?
              This will permanently remove all shared projects, clients, and
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
