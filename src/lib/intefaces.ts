// File interface
export interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: Date;
  updated_at: Date;
  visibility: "public" | "draft";
  url: string;
}
