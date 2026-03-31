import { axiosInstance } from '../../../lib/axios';
import type { Document, DocumentListResponse, UpdateDocumentPayload, UploadDocumentPayload } from '../types';

export const uploadDocument = async (payload: UploadDocumentPayload): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('title', payload.title);

  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim());
  }

  if (payload.category_id?.trim()) {
    formData.append('category_id', payload.category_id.trim());
  }

  const response = await axiosInstance.post<Document>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

type GetTeacherDocumentsParams = {
  skip: number;
  limit: number;
  search?: string;
  sortBy?: string;
  categoryId?: string | null;
};

export const getMyDocuments = async ({
  skip,
  limit,
  search,
  sortBy,
  categoryId,
}: GetTeacherDocumentsParams): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents/mine', {
    params: {
      skip,
      limit,
      search,
      sort_by: sortBy,
      category_id: categoryId,
    },
  });

  return response.data;
};

export const updateDocument = async (documentId: string, payload: UpdateDocumentPayload): Promise<Document> => {
  const response = await axiosInstance.patch<Document>(`/documents/${documentId}`, payload);
  return response.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await axiosInstance.delete(`/documents/${documentId}`);
};
