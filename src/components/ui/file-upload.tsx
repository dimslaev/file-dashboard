import React, { ReactNode, useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { FileRecord } from "@/lib/intefaces";
import {
  File as FileDefault,
  FilePdf,
  FileText,
  FileAudio,
  FileCode,
  FileCsv,
  FileDoc,
  FileImage,
  FilePpt,
  FileSvg,
  FileTxt,
  FileVideo,
  FileXls,
  X,
} from "@phosphor-icons/react";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  multiple?: boolean;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onFilesAccepted, multiple = false }, ref) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      onFilesAccepted(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      onFilesAccepted(files);
    };

    return (
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "flex items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        )}
      >
        <input
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          ref={ref}
        />
        <label
          htmlFor="file-upload"
          className={cn("text-center", isDragging && "pointer-events-none")}
        >
          {isDragging ? (
            <p className="text-blue-500">Drop the files here...</p>
          ) : (
            <p className="text-gray-500">
              Drag & drop some files here, or click to select files
            </p>
          )}
        </label>
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

interface FileItemProps {
  file: File;
  icon?: ReactNode;
  onRemove: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, icon, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-md">
      <div className="flex items-center">
        {icon && (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-4">
            {icon}
          </div>
        )}

        <div>
          <p className="text-card-foreground font-medium">{file.name}</p>
          <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
};

FileItem.displayName = "FileItem";

interface FileIconProps {
  file: File | FileRecord;
}

export const FileIcon: React.FC<FileIconProps> = ({ file }) => {
  const { type } = file;

  if (type === "application/pdf") {
    return <FilePdf className="size-5" />;
  } else if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileDoc className="size-5" />;
  } else if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <FileXls className="size-5" />;
  } else if (
    type === "application/vnd.ms-powerpoint" ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return <FilePpt className="size-5" />;
  } else if (type === "text/csv") {
    return <FileCsv className="size-5" />;
  } else if (type === "text/plain") {
    return <FileTxt className="size-5" />;
  } else if (
    type === "text/html" ||
    type === "application/javascript" ||
    type.startsWith("text/")
  ) {
    return <FileCode className="size-5" />;
  } else if (type.startsWith("image/svg+xml")) {
    return <FileSvg className="size-5" />;
  } else if (type.startsWith("image/")) {
    return <FileImage className="size-5" />;
  } else if (type.startsWith("audio/")) {
    return <FileAudio className="size-5" />;
  } else if (type.startsWith("video/")) {
    return <FileVideo className="size-5" />;
  } else if (
    type.startsWith("application/json") ||
    type.startsWith("application/xml")
  ) {
    return <FileText className="size-5" />;
  } else {
    return <FileDefault className="size-5" />;
  }
};

FileIcon.displayName = "FileIcon";
