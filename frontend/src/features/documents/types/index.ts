export type DocumentType = 'pdf' | 'docx' | 'excel' | 'text' | 'image' | 'video' | 'other';

export type DocumentStatus = 'available' | 'archived' | 'deleted';

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
  file_type: DocumentType;
  status: DocumentStatus;
  uploaded_by: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentItem = Document;

export type DocumentListResponse = {
  items: DocumentItem[];
  total: number;
  skip: number;
  limit: number;
};
