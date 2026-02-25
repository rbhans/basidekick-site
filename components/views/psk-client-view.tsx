"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useProjectStore,
  useClient,
  useClientProjects,
  ClientForm,
  STATUS_DOT_COLOR,
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ArrowLeft,
  Envelope,
  Phone,
  User,
  PencilSimple,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PSKKanbanStatus } from "@/lib/types";

interface PSKClientViewProps {
  clientId: string;
}

export function PSKClientView({ clientId }: PSKClientViewProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const initialize = useProjectStore((state) => state.initialize);
  const isLoading = useProjectStore((state) => state.isLoading);
  const client = useClient(clientId);
  const projects = useClientProjects(clientId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Initialize store when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.SIGNIN);
    }
  }, [authLoading, user, router]);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (error) {
      console.error("Failed to copy color", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center h-12 px-4 border-b border-border/40">
        <Link href={ROUTES.PSK} className="text-sm text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <span className="mx-1.5 text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-3 h-12 px-4 border-b border-border/40 shrink-0">
          <Link href={ROUTES.PSK} className="text-sm text-muted-foreground hover:text-foreground">
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Not Found</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This client doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button asChild size="sm">
              <Link href={ROUTES.PSK}>
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Compact Breadcrumb Header */}
      <header className="flex items-center gap-3 h-12 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <Link href={ROUTES.PSK} className="text-muted-foreground hover:text-foreground shrink-0">
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium truncate">{client.name}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{projects.length}</span>{" "}
          project{projects.length !== 1 ? "s" : ""}
        </span>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowEditDialog(true)}
        >
          <PencilSimple className="size-3.5 mr-1" />
          Edit
        </Button>
      </header>

      {/* Content: Primary + Sidebar */}
      <div className="flex-1 overflow-auto p-3">
        {client.notes && (
          <p className="text-sm text-muted-foreground mb-3">{client.notes}</p>
        )}

        <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
          {/* Primary: Projects */}
          <div className="rounded-md border border-border/40">
            <div className="px-3 py-2 border-b border-border/40">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Projects
              </h2>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No projects associated with this client yet.
              </p>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={ROUTES.PSK_PROJECT(project.id)}
                  className="flex items-center gap-3 px-3 py-2 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      STATUS_DOT_COLOR[project.status as PSKKanbanStatus] || "bg-muted-foreground"
                    )}
                  />
                  <span className="flex-1 text-sm font-medium truncate">
                    {project.name}
                  </span>
                  {project.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden sm:inline">
                      {project.description}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Sidebar: Contacts + Brand Colors */}
          <div className="space-y-3">
            {/* Contacts */}
            <div className="rounded-md border border-border/40">
              <div className="px-3 py-2 border-b border-border/40">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contacts
                </h2>
              </div>
              {client.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No contacts yet.
                </p>
              ) : (
                client.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 border-b border-border/40 last:border-b-0 space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <User className="size-3.5 text-muted-foreground" />
                      {contact.name}
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Envelope className="size-3" />
                        <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Brand Colors */}
            <div className="rounded-md border border-border/40">
              <div className="px-3 py-2 border-b border-border/40">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Brand Colors
                </h2>
              </div>
              <div className="px-3 py-2">
                {!client.color_palette || client.color_palette.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No colors added.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {client.color_palette.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleCopyColor(color)}
                        className="group flex flex-col items-center gap-0.5"
                        title={`Copy ${color}`}
                      >
                        <span
                          className="size-8 rounded-sm border border-border/40 relative"
                          style={{ backgroundColor: color }}
                        >
                          {copiedColor === color && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-sm">
                              <Check className="size-3.5 text-white" />
                            </span>
                          )}
                          {copiedColor !== color && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="size-3 text-white" />
                            </span>
                          )}
                        </span>
                        <code className="text-[10px] text-muted-foreground">{color}</code>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSave={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
