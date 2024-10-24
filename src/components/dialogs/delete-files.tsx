"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileRecord } from "@/lib/intefaces";
import { Spinner } from "@phosphor-icons/react";

export const DeleteFilesDialog = ({
  selectedFiles,
  file,
  isOpen,
  onClose,
  onSuccess,
}: {
  file: FileRecord | null;
  selectedFiles: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    (ids: string[]) => axios.delete(`/api/files?ids=${ids.join(",")}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["files"]);
        onClose();
        onSuccess();
      },
    }
  );

  const onConfirm = () => {
    if (file) {
      deleteMutation.mutate([file.id]);
    } else {
      deleteMutation.mutate(selectedFiles);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{file ? "Delete File" : "Delete Files"}</DialogTitle>
        </DialogHeader>

        {file ? (
          <div>Are you sure you want to delete this file?</div>
        ) : (
          <div>
            Are you sure you want to delete the selected files (
            {selectedFiles.length}) ?
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
            {deleteMutation.isLoading && (
              <Spinner className="ml-2 animate-spin w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
