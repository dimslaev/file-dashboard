import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/client";
import { z } from "zod";

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z
    .enum(["name", "size", "uploaded_at", "updated_at", "visibility"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  fileType: z.string().optional(),
  fileName: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from("files")
      .select("*", { count: "exact" })
      .range(from, to);

    if (query.fileType) {
      supabaseQuery = supabaseQuery.eq("type", query.fileType);
    }

    if (query.fileName) {
      supabaseQuery = supabaseQuery.ilike("name", `%${query.fileName}%`);
    }

    if (query.sortBy) {
      supabaseQuery = supabaseQuery.order(query.sortBy, {
        ascending: query.sortOrder === "asc",
      });
    }

    const { data: files, count, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      files,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const bucketName = "files";
const folderName = "private";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("name") as string;
    const visibility = formData.get("visibility") as "public" | "draft";
    const filePath = `${folderName}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(uploadData.path);

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

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from("files")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const { data: fileData, error: fetchError } = await supabase
      .from("files")
      .select("url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const fileName = fileData.url.split("/").pop();
    const { error: storageError } = await supabase.storage
      .from("files")
      .remove([fileName]);

    if (storageError) {
      throw storageError;
    }

    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
