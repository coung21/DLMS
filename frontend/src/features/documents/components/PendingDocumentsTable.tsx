import { FileText, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import type { Document } from '../types';

interface PendingDocumentsTableProps {
    documents: Document[];
    isLoading: boolean;
    onReview: (document: Document) => void;
}

export const PendingDocumentsTable = ({
    documents,
    isLoading,
    onReview,
}: PendingDocumentsTableProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="text-slate-600 mt-4 font-semibold">Đang tải tài liệu...</p>
                </div>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <FileText className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-600 font-semibold text-lg">Không có tài liệu chờ duyệt</p>
                <p className="text-slate-500 text-sm">Tất cả các tài liệu đã được xem xét!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tiêu đề</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                Người tải lên
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Loại</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                Ngày tải lên
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr
                                key={doc.id}
                                className="border-b border-slate-200 hover:bg-indigo-50/30 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{doc.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="font-mono text-xs truncate">{doc.uploaded_by || 'Trống'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold uppercase">
                                        {doc.file_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getStatusColor(doc.status)} w-fit`}>
                                        {getStatusIcon(doc.status)}
                                        <span className="text-xs font-semibold capitalize">{doc.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {doc.status === 'pending' ? (
                                        <button
                                            onClick={() => onReview(doc)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition-colors"
                                        >
                                            Duyệt
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-500 font-semibold">
                                            {doc.status === 'approved' ? '✓ Đã duyệt' : '✗ Đã từ chối'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
