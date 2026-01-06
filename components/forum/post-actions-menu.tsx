"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";

interface PostActionsMenuProps {
  postAuthorId: string;
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostActionsMenu({
  postAuthorId,
  currentUserId,
  onEdit,
  onDelete,
}: PostActionsMenuProps) {
  // Only show menu if current user is the post author
  if (!currentUserId || currentUserId !== postAuthorId) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <DotsThreeVertical className="size-4" />
          <span className="sr-only">Post actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <PencilSimple className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
