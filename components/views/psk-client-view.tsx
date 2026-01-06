"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
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
} from "@/components/projects";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ArrowLeft,
  Envelope,
  Phone,
  User,
  Folder,
  PencilSimple,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

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
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>client</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Loading...
            </h1>
          </div>
        </section>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>client</SectionLabel>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Client Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This client doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.PSK}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href={ROUTES.PSK}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <SectionLabel>client</SectionLabel>
              <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
                {client.name}
              </h1>
              {client.notes && (
                <p className="mt-2 text-muted-foreground max-w-xl">
                  {client.notes}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
            >
              <PencilSimple className="mr-2 size-4" />
              Edit
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contacts */}
            <div className="border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Contacts</h2>
              </div>
              <div className="p-4">
                {client.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No contacts added yet.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {client.contacts.map((contact, index) => (
                      <li
                        key={index}
                        className="flex flex-col gap-1 p-3 border border-border"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <User className="size-4 text-muted-foreground" />
                          {contact.name}
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Envelope className="size-4" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-foreground"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-4" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-foreground"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Brand Colors */}
            <div className="border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Brand Colors</h2>
              </div>
              <div className="p-4">
                {!client.color_palette || client.color_palette.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No brand colors added yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {client.color_palette.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleCopyColor(color)}
                        className="group flex flex-col items-center gap-1"
                        title={`Copy ${color}`}
                      >
                        <span
                          className="size-12 border border-border relative"
                          style={{ backgroundColor: color }}
                        >
                          {copiedColor === color && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Check className="size-5 text-white" />
                            </span>
                          )}
                          {copiedColor !== color && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="size-4 text-white" />
                            </span>
                          )}
                        </span>
                        <code className="text-xs text-muted-foreground">
                          {color}
                        </code>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="mt-6 border border-border bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Projects ({projects.length})</h2>
            </div>
            <div className="p-4">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No projects associated with this client yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={ROUTES.PSK_PROJECT(project.id)}
                        className="flex items-center gap-3 p-3 border border-border hover:bg-accent transition-colors"
                      >
                        <Folder className="size-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 capitalize ${
                            project.status === "completed"
                              ? "bg-green-500/20 text-green-500"
                              : project.status === "in-progress"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : project.status === "review"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {project.status.replace("-", " ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

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
