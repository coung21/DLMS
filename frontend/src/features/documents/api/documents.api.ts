import { axiosInstance } from '../../../lib/axios';
import type { DocumentListResponse } from '../types';

type GetDocumentsParams = {
  skip: number;
  limit: number;
};

export const getDocuments = async ({
  skip,
  limit,
}: GetDocumentsParams): Promise<DocumentListResponse> => {
  const response = await axiosInstance.get<DocumentListResponse>('/documents', {
    params: { skip, limit },
  });

  return response.data;
};
