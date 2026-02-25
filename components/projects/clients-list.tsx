"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Plus,
  User,
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

function ClientRow({ client }: { client: PSKClient }) {
  const { deleteClient } = useClients();
  const projects = useClientProjects(client.id);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteClient(client.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors">
        {/* Avatar */}
        <div className="size-6 rounded-sm bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
          {client.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={client.logo}
              alt={`${client.name} logo`}
              className="size-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <User className="size-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Name */}
        <Link
          href={ROUTES.PSK_CLIENT(client.id)}
          className="flex-1 text-sm font-medium truncate hover:underline"
        >
          {client.name}
        </Link>

        {/* Project count */}
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </span>

        {/* Color swatches */}
        {client.color_palette && client.color_palette.length > 0 && (
          <div className="flex gap-0.5 shrink-0 hidden md:flex">
            {client.color_palette.slice(0, 3).map((color) => (
              <span
                key={color}
                className="size-3 rounded-full border border-border/40"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setShowEditDialog(true)}
          >
            <PencilSimple className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="size-3.5" />
          </Button>
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
    <div className="rounded-md border border-border/40">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
        <div className="relative flex-1">
          <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs shrink-0">
              <Plus className="size-3.5 mr-1" />
              New
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

      {/* Client Rows */}
      <div>
        {filteredClients.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "No clients match your search." : "No clients yet."}
            </p>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="mr-1 size-3.5" />
                Add First Client
              </Button>
            )}
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientRow key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  );
}
