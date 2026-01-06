"use client";

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
import { Warning } from "@phosphor-icons/react";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  isFirstPost?: boolean;
}

export function DeletePostDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  isFirstPost = false,
}: DeletePostDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isFirstPost && <Warning className="size-5 text-destructive" />}
            {isFirstPost ? "Delete Thread?" : "Delete Post?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isFirstPost ? (
              <>
                This is the first post in the thread. Deleting it will{" "}
                <strong>permanently delete the entire thread</strong> and all
                replies. This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete this post? This action cannot be
                undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : isFirstPost ? "Delete Thread" : "Delete Post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
