"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, ErrorMessage } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileRecord } from "@/lib/intefaces";
import { Spinner } from "@phosphor-icons/react";

const updateFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  visibility: z.enum(["public", "draft"]),
});

type UpdateFileSchema = z.infer<typeof updateFileSchema>;

export const UpdateFileDialog = ({
  file,
  isOpen,
  onClose,
  onSuccess,
}: {
  file: FileRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    (data: Partial<FileRecord>) =>
      axios.put("/api/files", { id: file.id, ...data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["files"]);
        onClose();
        onSuccess();
      },
    }
  );

  const { register, handleSubmit, setValue, formState, watch } =
    useForm<UpdateFileSchema>({
      defaultValues: {
        name: file.name,
        visibility: file.visibility,
      },
      resolver: zodResolver(updateFileSchema),
    });

  const visibility = watch("visibility");

  const onSubmit = (data: Partial<FileRecord>) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-2 md:w-1/2">
              <Label htmlFor="name">Rename file</Label>
              <div className="flex flex-col gap-1">
                <Input id="name" {...register("name")} />
                {formState.errors.name && (
                  <ErrorMessage>{formState.errors.name.message}</ErrorMessage>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="visibility">Visibility</Label>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  defaultChecked={file.visibility === "public"}
                  onCheckedChange={(checked: boolean) => {
                    setValue("visibility", checked ? "public" : "draft");
                  }}
                />

                <span className="text-sm">
                  {visibility === "public" ? "Public" : "Draft"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              Update
              {updateMutation.isLoading && (
                <Spinner className="ml-2 animate-spin w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
