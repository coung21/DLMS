import { useEffect, useState } from 'react';
import { FileText, Search, AlertCircle } from 'lucide-react';
import type { Document, PendingDocumentsResponse } from '../../features/documents/types';
import { PendingDocumentsTable } from '../../features/documents/components/PendingDocumentsTable';
import { ReviewDocumentModal } from '../../features/documents/components/ReviewDocumentModal';
import {
    getPendingDocuments,
    approveDocument,
    rejectDocument,
} from '../../features/documents/api/documents-review.api';

export const DocumentReviewPage = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch pending documents
    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response: PendingDocumentsResponse = await getPendingDocuments(0, 50, searchQuery);
            setDocuments(response.items);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load documents'
            );
            console.error('Error fetching documents:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchDocuments, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle approval
    const handleApprove = async (comment?: string) => {
        if (!selectedDocument) return;

        try {
            setIsReviewLoading(true);
            await approveDocument(selectedDocument.id, comment);
            setSuccessMessage(`✓ Document "${selectedDocument.title}" has been approved!`);
            setSelectedDocument(null);
            fetchDocuments(); // Refresh list

            // Clear message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to approve document'
            );
            console.error('Error approving document:', err);
        } finally {
            setIsReviewLoading(false);
        }
    };

    // Handle rejection
    const handleReject = async (comment: string) => {
        if (!selectedDocument) return;

        try {
            setIsReviewLoading(true);
            await rejectDocument(selectedDocument.id, comment);
            setSuccessMessage(`✗ Document "${selectedDocument.title}" has been rejected.`);
            setSelectedDocument(null);
            fetchDocuments(); // Refresh list

            // Clear message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to reject document'
            );
            console.error('Error rejecting document:', err);
        } finally {
            setIsReviewLoading(false);
        }
    };

    const pendingCount = documents.filter((d) => d.status === 'pending').length;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Document Review</h1>
                    </div>
                    <p className="text-slate-600">Review and approve/reject documents uploaded by teachers</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg text-green-800 font-semibold flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                            ✓
                        </div>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 font-semibold flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 font-semibold">Pending Review</p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 font-semibold">Total Documents</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{documents.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 font-semibold">Processed/Reviewed</p>
                        <p className="text-3xl font-bold text-indigo-600 mt-2">
                            {documents.filter((d) => d.status !== 'pending').length}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <PendingDocumentsTable
                        documents={documents}
                        isLoading={isLoading}
                        onReview={setSelectedDocument}
                    />
                </div>
            </div>

            {/* Review Modal */}
            <ReviewDocumentModal
                document={selectedDocument!}
                isOpen={!!selectedDocument}
                isLoading={isReviewLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onClose={() => setSelectedDocument(null)}
            />
        </div>
    );
};
