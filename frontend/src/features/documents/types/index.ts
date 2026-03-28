export type UploadDocumentPayload = {
  file: File;
  title: string;
  description?: string;
  category_id?: string;
};

export type Document = {
  id: string;
  title: string;
  description: string;
  file_path: string | null;
  file_type: 'pdf' | 'docx' | 'excel' | 'text' | 'image' | 'video' | 'other';
  status: 'available' | 'archived' | 'deleted';
  uploaded_by: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};
