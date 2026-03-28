import { axiosInstance } from '../../../lib/axios';
import type { Document, UploadDocumentPayload } from '../types';

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
