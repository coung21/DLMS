import { axiosInstance } from '../../../lib/axios';
import type { DocumentListResponse } from '../types';

type GetDocumentsParams = {
  skip: number;
  limit: number;
  categoryId?: string | null;
  search?: string;
  sortBy?: string;
  fileType?: string;
};

export const getDocuments = async ({
  skip,
  limit,
  categoryId,
  search,
  sortBy,
  fileType,
}: GetDocumentsParams): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents', {
    params: { skip, limit, category_id: categoryId, search, sort_by: sortBy, file_type: fileType },
  });

  return response.data;
};
