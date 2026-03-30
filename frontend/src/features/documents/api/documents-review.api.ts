import { axiosInstance } from '../../../lib/axios';
import type { PendingDocumentsResponse, ReviewDocumentPayload, Document } from '../types';

export const getPendingDocuments = async (
    skip: number = 0,
    limit: number = 10,
    search?: string,
    sortBy?: string
): Promise<PendingDocumentsResponse> => {
    const response = await axiosInstance.get<PendingDocumentsResponse>('/documents/pending', {
        params: {
            skip,
            limit,
            search,
            sort_by: sortBy,
        },
    });

    return response.data;
};

export const reviewDocument = async (
    documentId: string,
    payload: ReviewDocumentPayload
): Promise<Document> => {
    const response = await axiosInstance.post<Document>(
        `/documents/${documentId}/review`,
        payload
    );

    return response.data;
};

export const approveDocument = async (
    documentId: string,
    reviewComment?: string
): Promise<Document> => {
    const formData = new FormData();
    if (reviewComment) {
        formData.append('review_comment', reviewComment);
    }

    const response = await axiosInstance.post<Document>(
        `/documents/${documentId}/approve`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

export const rejectDocument = async (
    documentId: string,
    reviewComment: string
): Promise<Document> => {
    const formData = new FormData();
    formData.append('review_comment', reviewComment);

    const response = await axiosInstance.post<Document>(
        `/documents/${documentId}/reject`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};
