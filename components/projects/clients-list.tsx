"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Plus,
  User,
  Envelope,
  Phone,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useClients, useClientProjects } from "./project-hooks";
import { ClientForm } from "./client-form";
import { ROUTES } from "@/lib/routes";
import type { PSKClient } from "@/lib/types";

function ClientCard({ client }: { client: PSKClient }) {
  const { deleteClient } = useClients();
  const projects = useClientProjects(client.id);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const primaryContact = client.contacts[0];

  const handleDelete = async () => {
    await deleteClient(client.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="border border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {client.logo ? (
            <div className="size-10 border border-border bg-muted flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={client.logo}
                alt={`${client.name} logo`}
                className="size-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="size-10 border border-border bg-muted flex-shrink-0 flex items-center justify-center">
              <User className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={ROUTES.PSK_CLIENT(client.id)}
              className="font-medium hover:underline block truncate"
            >
              {client.name}
            </Link>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setShowEditDialog(true)}
            >
              <PencilSimple className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="size-4" />
            </Button>
          </div>
        </div>

        {primaryContact && (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="size-3.5" />
              <span>{primaryContact.name}</span>
            </div>
            {primaryContact.email && (
              <div className="flex items-center gap-2">
                <Envelope className="size-3.5" />
                <span className="truncate">{primaryContact.email}</span>
              </div>
            )}
            {primaryContact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-3.5" />
                <span>{primaryContact.phone}</span>
              </div>
            )}
          </div>
        )}

        {client.color_palette && client.color_palette.length > 0 && (
          <div className="flex gap-1">
            {client.color_palette.slice(0, 5).map((color) => (
              <span
                key={color}
                className="size-5 border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            {client.color_palette.length > 5 && (
              <span className="size-5 flex items-center justify-center text-xs text-muted-foreground">
                +{client.color_palette.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
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

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{client.name}&quot;? This
              will remove the client from all associated projects. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ClientsList() {
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;

    const searchLower = search.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.contacts.some(
          (contact) =>
            contact.name.toLowerCase().includes(searchLower) ||
            contact.email?.toLowerCase().includes(searchLower)
        )
    );
  }, [clients, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Client</DialogTitle>
            </DialogHeader>
            <ClientForm
              onSave={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            {search ? "No clients match your search." : "No clients yet."}
          </p>
          {!search && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="mr-2 size-4" />
              Add Your First Client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
