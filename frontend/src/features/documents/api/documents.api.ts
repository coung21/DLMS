import { axiosInstance } from '../../../lib/axios';
import type { Document, DocumentListResponse, ReviewDocumentPayload } from '../types';

type GetDocumentsParams = {
  skip: number;
  limit: number;
  categoryId?: string | null;
  search?: string;
  sortBy?: string;
};

export const getDocuments = async ({
  skip,
  limit,
  categoryId,
  search,
  sortBy,
}: GetDocumentsParams): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents', {
    params: { skip, limit, category_id: categoryId, search, sort_by: sortBy },
  });

  return response.data;
};
export const getMyDocuments = async ({
  skip,
  limit,
  categoryId,
  search,
  sortBy,
}: GetDocumentsParams): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents/mine', {
    params: { skip, limit, category_id: categoryId, search, sort_by: sortBy },
  });

  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/documents/${id}`);
};

export const updateDocument = async (
  id: string,
  payload: Partial<Document>
): Promise<Document> => {
  const response = await axiosInstance.patch<Document>(`/documents/${id}`, payload);
  return response.data;
};

export const getPendingDocuments = async ({
  skip,
  limit,
  search,
  sortBy,
}: Omit<GetDocumentsParams, 'categoryId'>): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents/pending', {
    params: { skip, limit, search, sort_by: sortBy },
  });

  return response.data;
};

export const reviewDocument = async (
  id: string,
  payload: ReviewDocumentPayload
): Promise<Document> => {
  const response = await axiosInstance.post<Document>(`/documents/${id}/review`, payload);
  return response.data;
};

export const getDocumentPreviewUrl = async (id: string): Promise<string> => {
  const response = await axiosInstance.get<{ url: string }>(`/documents/${id}/preview`);
  return response.data.url;
};

export const getDocumentDownloadUrl = async (id: string): Promise<string> => {
  const response = await axiosInstance.get<{ url: string }>(`/documents/${id}/download`);
  return response.data.url;
};
