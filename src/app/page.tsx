"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "axios";

import { cn, formatFileSize } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks";
import { FileRecord } from "@/lib/intefaces";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FileIcon } from "@/components/ui/file-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { UploadFileDialog } from "@/components/dialogs/upload-file";
import { UpdateFileDialog } from "@/components/dialogs/update-file";
import { DeleteFilesDialog } from "@/components/dialogs/delete-files";

import {
  DotsThreeVertical,
  DownloadSimple,
  Trash,
  Upload,
  CaretUp,
  CaretDown,
  PencilSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";

const cols: {
  id: keyof FileRecord;
  title: string;
  className: string;
  sortable: boolean;
}[] = [
  {
    id: "name",
    title: "Name",
    className:
      "w-[50%] md:w-[30%] overflow-hidden text-ellipsis whitespace-nowrap",
    sortable: true,
  },
  {
    id: "size",
    title: "Size",
    className: "whitespace-nowrap",
    sortable: true,
  },
  {
    id: "uploaded_at",
    title: "Uploaded",
    className: "hidden md:table-cell whitespace-nowrap",
    sortable: true,
  },
  {
    id: "updated_at",
    title: "Updated",
    className: "hidden md:table-cell whitespace-nowrap",
    sortable: true,
  },
  {
    id: "visibility",
    title: "Visibility",
    className: "whitespace-nowrap",
    sortable: true,
  },
];

const FileTable = () => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [openDialog, setOpenDialog] = useState<
    "edit" | "upload" | "delete" | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof FileRecord>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data, isLoading } = useQuery<{
    currentPage: number;
    totalPages: number;
    files: FileRecord[];
  }>(
    ["files", page, pageSize, sortBy, sortOrder, debouncedSearchTerm],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(debouncedSearchTerm && { fileName: debouncedSearchTerm }),
      });
      const response = await axios.get(`/api/files?${params}`);
      setIsInitialLoad(false);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 1000,
    }
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof FileRecord) => {
    setSortOrder(sortBy === column && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(column);
  };

  const SortIcon = ({ column }: { column: keyof FileRecord }) => {
    if (sortBy !== column)
      return <CaretUp className="ml-2 h-4 w-4 inline text-gray-400" />;
    return sortOrder === "asc" ? (
      <CaretUp className="ml-2 h-4 w-4 inline" />
    ) : (
      <CaretDown className="ml-2 h-4 w-4 inline" />
    );
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedFiles(
      checked && data?.files ? data.files.map((file) => file.id) : []
    );
  };

  const resetSelections = () => {
    setSelectedFile(null);
    setSelectedFiles([]);
    setOpenDialog(null);
  };

  const handleDownload = (url: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = url.split("/").pop()!;
        link.click();
      })
      .catch(console.error);
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = data?.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPaginationItems = () => {
    const totalPages = data?.totalPages || 1;
    const maxVisiblePages = 3;
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
      const pageNumber = startPage + index;
      return (
        <PaginationItem key={pageNumber}>
          <PaginationLink
            onClick={() => handlePageChange(pageNumber)}
            isActive={page === pageNumber}
          >
            {pageNumber}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="pt-1 hidden md:table-cell w-[50px]">
          <Checkbox
            checked={
              selectedFiles.length > 0 &&
              selectedFiles.length === data?.files?.length
            }
            onCheckedChange={toggleSelectAll}
          />
        </TableHead>
        {cols.map((column) => (
          <TableHead
            key={column.id}
            onClick={() => handleSort(column.id)}
            className={column.className}
          >
            {column.title}
            {column.sortable && <SortIcon column={column.id} />}
          </TableHead>
        ))}
        <TableHead className="w-[50px] md:w-[110px]"></TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderTableRows = () =>
    data?.files?.map((file) => (
      <TableRow key={file.id}>
        <TableCell className="pt-5 hidden md:table-cell">
          <Checkbox
            checked={selectedFiles.includes(file.id)}
            onCheckedChange={() => toggleFileSelection(file.id)}
          />
        </TableCell>
        <TableCell className="font-medium">
          <a
            className="flex items-center hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              handleDownload(file.url);
            }}
            href={file.url}
          >
            <span className="hidden md:inline mr-2">
              <FileIcon file={file} />
            </span>
            <div className="whitespace-nowrap text-ellipsis overflow-hidden">
              {file.name}
            </div>
          </a>
        </TableCell>
        <TableCell>{formatFileSize(file.size)}</TableCell>
        <TableCell className="hidden md:table-cell whitespace-nowrap">
          {format(new Date(file.uploaded_at), "MMM d, yyyy")}
        </TableCell>
        <TableCell className="hidden md:table-cell whitespace-nowrap">
          {format(new Date(file.updated_at), "MMM d, yyyy")}
        </TableCell>
        <TableCell>
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs uppercase",
              file.visibility === "public"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            )}
          >
            {file.visibility}
          </span>
        </TableCell>
        <TableCell>{renderActionButtons(file)}</TableCell>
      </TableRow>
    ));

  const renderTableLoading = () =>
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`row-loading-${index}`} className="animate-pulse">
        <TableCell className="pt-5 hidden md:table-cell">
          <div className="h-4 bg-gray-200 rounded"></div>
        </TableCell>
        <TableCell className="font-medium">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </TableCell>
        <TableCell className="hidden md:table-cell whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </TableCell>
        <TableCell className="hidden md:table-cell whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </TableCell>
      </TableRow>
    ));

  const renderActionButtons = (file: FileRecord) => (
    <>
      <div className="hidden lg:flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedFile(file);
            setOpenDialog("edit");
          }}
        >
          <PencilSimple className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedFile(file);
            setOpenDialog("delete");
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-end lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <DotsThreeVertical weight="bold" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload(file.url)}>
              <DownloadSimple className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelectedFile(file);
                setOpenDialog("edit");
              }}
            >
              <PencilSimple className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedFile(file);
                setOpenDialog("delete");
              }}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">File dashboard</h1>
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex justify-end gap-2">
          <div className="hidden md:flex justify-end gap-2">
            {selectedFiles.length > 0 && (
              <Button onClick={() => setOpenDialog("delete")} variant="ghost">
                <Trash className="mr-2 size-4" />
                Delete ({selectedFiles.length})
              </Button>
            )}
          </div>
          <Button onClick={() => setOpenDialog("upload")}>
            <Upload className=" mr-2 size-4" />
            Upload File
          </Button>
        </div>
      </div>

      <Table className="table-fixed">
        {renderTableHeader()}
        <TableBody>
          {isInitialLoad && renderTableLoading()}
          {renderTableRows()}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              className={
                page === (data?.totalPages || 1)
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {openDialog === "delete" && (
        <DeleteFilesDialog
          selectedFiles={selectedFiles}
          file={selectedFile}
          isOpen={true}
          onSuccess={resetSelections}
          onClose={() => {
            setOpenDialog(null);
            setSelectedFile(null);
          }}
        />
      )}

      {openDialog === "upload" && (
        <UploadFileDialog
          isOpen={true}
          onSuccess={resetSelections}
          onClose={() => {
            setOpenDialog(null);
          }}
        />
      )}

      {selectedFile && openDialog === "edit" && (
        <UpdateFileDialog
          file={selectedFile}
          isOpen={true}
          onSuccess={resetSelections}
          onClose={() => {
            setOpenDialog(null);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default FileTable;
