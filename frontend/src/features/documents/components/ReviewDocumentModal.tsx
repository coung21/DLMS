import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { Document } from '../types';

interface ReviewDocumentModalProps {
    document: Document;
    isOpen: boolean;
    isLoading: boolean;
    onApprove: (comment?: string) => void;
    onReject: (comment: string) => void;
    onClose: () => void;
}

export const ReviewDocumentModal = ({
    document,
    isOpen,
    isLoading,
    onApprove,
    onReject,
    onClose,
}: ReviewDocumentModalProps) => {
    const [reviewComment, setReviewComment] = useState('');
    const [rejecting, setRejecting] = useState(false);

    if (!isOpen) return null;

    const handleApprove = () => {
        onApprove(reviewComment || undefined);
    };

    const handleReject = () => {
        if (!reviewComment.trim()) {
            alert('Vui lòng cung cấp lý do từ chối');
            return;
        }
        setRejecting(true);
        onReject(reviewComment);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 border-b border-indigo-700">
                    <h2 className="text-2xl font-bold">Duyệt tài liệu</h2>
                    <p className="text-indigo-100 text-sm mt-1">Đưa ra quyết định phê duyệt hoặc từ chối</p>
                </div>

                {/* Document Info */}
                <div className="p-6 border-b border-slate-200">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tiêu đề</label>
                            <p className="text-slate-900 font-medium text-lg">{document.title}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Mô tả
                            </label>
                            <p className="text-slate-700 whitespace-pre-wrap">
                                {document.description || '(Không có mô tả)'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Loại tệp
                                </label>
                                <p className="text-slate-700 uppercase text-sm">{document.file_type}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Kích thước tệp
                                </label>
                                <p className="text-slate-700 text-sm">
                                    {document.file_size > 0
                                        ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                                        : 'Không xác định'}
                                </p>
                            </div>
                        </div>

                        {document.original_file_name && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Tên tệp gốc
                                </label>
                                <p className="text-slate-700 text-sm font-mono break-all">
                                    {document.original_file_name}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Đã tải lên</label>
                                <p className="text-slate-600">{new Date(document.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Người tải lên</label>
                                <p className="text-slate-600 font-mono text-xs">{document.uploaded_by}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Comment */}
                <div className="p-6 border-b border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nhận xét</label>
                    <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={
                            rejecting
                                ? 'Giải thích lý do bạn từ chối tài liệu này...'
                                : 'Nhận xét tùy chọn khi phê duyệt...'
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        {rejecting && <span className="text-amber-600 font-semibold">* Bắt buộc khi từ chối</span>}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={() => {
                            setRejecting(true);
                            handleReject();
                        }}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isLoading && rejecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang từ chối...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />
                                Từ chối
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setRejecting(false);
                            handleApprove();
                        }}
                        disabled={isLoading}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isLoading && !rejecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang phê duyệt...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Phê duyệt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
