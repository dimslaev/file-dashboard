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
import { ErrorMessage, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileUpload, FileItem, FileIcon } from "@/components/ui/file-upload";
import { getFileBaseName } from "@/lib/utils";
import { Spinner } from "@phosphor-icons/react";

const uploadFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  visibility: z.enum(["public", "draft"]),
  file: z.instanceof(File),
});

type UploadFileSchema = z.infer<typeof uploadFileSchema>;

const defaultValues = {
  name: "",
  visibility: "draft",
  file: null,
} as unknown as UploadFileSchema;

export const UploadFileDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(
    (newFile: FormData) => axios.post("/api/files", newFile),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["files"]);
        onClose();
        onSuccess();
      },
    }
  );

  const { register, handleSubmit, setValue, formState, watch } =
    useForm<UploadFileSchema>({
      defaultValues,

      resolver: zodResolver(uploadFileSchema),
    });

  const fileInput = watch("file");
  const visibility = watch("visibility");

  const onSubmit = (data: UploadFileSchema) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("visibility", data.visibility);
    formData.append("file", data.file);
    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1">
              {fileInput ? (
                <FileItem
                  file={fileInput}
                  icon={<FileIcon file={fileInput} />}
                  onRemove={() => {
                    // @ts-expect-error
                    setValue("file", null);
                  }}
                />
              ) : (
                <FileUpload
                  onFilesAccepted={(files) => {
                    setValue("file", files[0]);
                    setValue("name", getFileBaseName(files[0].name));
                  }}
                />
              )}

              {formState.errors.file && (
                <ErrorMessage>{formState.errors.file.message}</ErrorMessage>
              )}
            </div>

            {fileInput && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 md:w-1/2">
                  <Label htmlFor="name">Rename file</Label>
                  <div className="flex flex-col gap-1">
                    <Input id="name" {...register("name")} />
                    {formState.errors.name && (
                      <ErrorMessage>
                        {formState.errors.name.message}
                      </ErrorMessage>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="visibility">Visibility</Label>

                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      defaultChecked={defaultValues.visibility === "public"}
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
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!fileInput}>
              Upload
              {uploadMutation.isLoading && (
                <Spinner className="ml-2 animate-spin w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
