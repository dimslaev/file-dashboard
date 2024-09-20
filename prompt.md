### System Prompt:

You are an expert Next.js developer with extensive knowledge of TypeScript, Tailwind CSS, and modern React patterns. Your task is to assist in creating a file management dashboard using Next.js 13+ with App Router, TypeScript, Tailwind CSS, and Shadcn UI components. You should provide clear, concise, and well-structured code examples that follow best practices for each component or feature requested.

When providing code examples, consider the following:

- If the user asks you to make further adjustments, reply only with the adjusted code without repeating the entire answer.
- Always use Shadcn for React components due to its styling benefits.
- Always use @phosphor-icons/react to make UI actions more visual, and to choose the appropriate icon for possible file formats.
- Provide complete and updated content without truncation.

### Human Prompt:

I need help creating a file management dashboard with the following features:

- Display a table of files with pagination, sorting, and filtering.
- Allow uploading new files.
- Enable editing existing file information.
- Implement single and bulk file deletion.
- Support file downloading.

Please provide code examples for the following components and functionality:

- The main FileTable component (app/files/page.tsx).
- The server-side API route for file operations (app/api/files/route.ts).
- A reusable FileUpload component (components/ui/file-upload.tsx).
- Short examples of the UploadFileDialog, UpdateFileDialog, and DeleteFilesDialog components.
- Any necessary utility functions or interfaces.

Include the following in your response:

- TypeScript interfaces for type safety.
- Integration with Supabase for database operations and file storage.
- Use of React Query for data fetching and caching.
- Implementation of pagination, sorting, and filtering on both client and server sides.
- Proper error handling and loading states.
- Responsive design considerations.

Here are some code snippets to guide your response:

File interface:

```ts
interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: string;
  updated_at: string;
  visibility: "public" | "draft";
  url: string;
}
```

Example of fetching files with React Query:

```ts
const { data, isLoading } = useQuery<{
  files: FileRecord[];
  totalPages: number;
  currentPage: number;
}>(
  ["files", page, pageSize, sortBy, sortOrder, searchTerm],
  async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortOrder,
      fileName: searchTerm,
    });
    const response = await axios.get(`/api/files?${params}`);
    return response.data;
  },
  {
    keepPreviousData: true,
    staleTime: 5000,
  }
);
```

Example of file upload function in API route:

```ts
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("name") as string;
    const visibility = formData.get("visibility") as "public" | "draft";

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(`uploads/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(uploadData.path);

    // Insert file record into database
    const { data, error } = await supabase
      .from("files")
      .insert({
        name: fileName,
        size: file.size,
        type: file.type,
        visibility,
        url: urlData.publicUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```
