import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  PencilLine,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';

import { getApiErrorMessage } from '../../../lib/api-error';
import { deleteDocument, getMyDocuments, updateDocument } from '../api/document.api';
import type { Document } from '../types';

const PAGE_SIZE = 5;

const buildPageNumbers = (page: number, totalPages: number) => {
  const maxVisiblePages = 5;
  const start = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));
  const end = Math.min(totalPages, start + maxVisiblePages - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

type EditDraft = {
  title: string;
  description: string;
};

type FeedbackState = {
  tone: 'success' | 'error';
  message: string;
};

export const TeacherDocumentManager = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ title: '', description: '' });
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(searchInput.trim());
  const skip = (page - 1) * PAGE_SIZE;

  const query = useQuery({
    queryKey: ['teacher-documents', page, deferredSearch, sortBy],
    queryFn: () =>
      getMyDocuments({
        skip,
        limit: PAGE_SIZE,
        search: deferredSearch || undefined,
        sortBy,
      }),
    placeholderData: keepPreviousData,
  });

  const documents = query.data?.items ?? [];
  const totalDocuments = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalDocuments / PAGE_SIZE));
  const visiblePages = buildPageNumbers(page, totalPages);
  const currentStart = totalDocuments === 0 ? 0 : skip + 1;
  const currentEnd = totalDocuments === 0 ? 0 : skip + documents.length;

  useEffect(() => {
    startTransition(() => {
      setPage(1);
    });
  }, [deferredSearch, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      startTransition(() => {
        setPage(totalPages);
      });
    }
  }, [page, totalPages]);

  const closeEditor = () => {
    setEditingDocumentId(null);
    setEditDraft({ title: '', description: '' });
  };

  const updateMutation = useMutation({
    mutationFn: ({ documentId, payload }: { documentId: string; payload: { title: string; description: string } }) =>
      updateDocument(documentId, payload),
    onMutate: ({ documentId }) => {
      setUpdatingDocumentId(documentId);
      setFeedback(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setFeedback({ tone: 'success', message: 'Đã cập nhật chi tiết tài liệu.' });
      closeEditor();
    },
    onError: (error) => {
      setFeedback({ tone: 'error', message: getApiErrorMessage(error, 'Không thể cập nhật tài liệu.') });
    },
    onSettled: () => {
      setUpdatingDocumentId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onMutate: (documentId) => {
      setDeletingDocumentId(documentId);
      setFeedback(null);
    },
    onSuccess: (_, documentId) => {
      if (documents.length === 1 && page > 1) {
        startTransition(() => {
          setPage((currentPage) => Math.max(1, currentPage - 1));
        });
      }

      if (editingDocumentId === documentId) {
        closeEditor();
      }

      queryClient.invalidateQueries({ queryKey: ['teacher-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setFeedback({ tone: 'success', message: 'Đã xóa tài liệu.' });
    },
    onError: (error) => {
      setFeedback({ tone: 'error', message: getApiErrorMessage(error, 'Không thể xóa tài liệu.') });
    },
    onSettled: () => {
      setDeletingDocumentId(null);
    },
  });

  const openEditor = (document: Document) => {
    setFeedback(null);
    setEditingDocumentId(document.id);
    setEditDraft({
      title: document.title,
      description: document.description ?? '',
    });
  };

  const handleSave = (documentId: string) => {
    const normalizedTitle = editDraft.title.trim();
    if (!normalizedTitle) {
      setFeedback({ tone: 'error', message: 'Vui lòng nhập tiêu đề.' });
      return;
    }

    updateMutation.mutate({
      documentId,
      payload: {
        title: normalizedTitle,
        description: editDraft.description.trim(),
      },
    });
  };

  const handleDelete = (document: Document) => {
    if (window.confirm(`Xóa "${document.title}" khỏi thư viện của bạn?`)) {
      deleteMutation.mutate(document.id);
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white/96 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.7)] xl:p-8">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              <FileText className="h-4 w-4" />
              Tài liệu của tôi
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Chỉnh sửa hoặc xóa tài liệu tải lên của bạn</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Bảng điều khiển này chỉ hiển thị các tài liệu được tải lên bởi tài khoản giáo viên hiện tại, cho phép bạn chỉnh sửa siêu dữ liệu hoặc xóa tệp.
            </p>
          </div>

          <button
            onClick={() => query.refetch()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            {query.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Làm mới
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm kiếm tài liệu của bạn"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
            />
          </label>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
          >
            <option value="created_at_desc">Mới nhất trước</option>
            <option value="created_at_asc">Cũ nhất trước</option>
            <option value="title_asc">Tiêu đề A-Z</option>
            <option value="title_desc">Tiêu đề Z-A</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tài liệu sở hữu</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{totalDocuments}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Trang hiện tại</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{page}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Mục hiển thị</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {currentStart}-{currentEnd}
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-6 rounded-3xl border px-4 py-3 text-sm font-medium ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {query.isLoading ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#eef2f7)]"
            />
          ))}
        </div>
      ) : query.isError ? (
        <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-lg font-semibold text-rose-800">Không thể tải tài liệu của bạn</h3>
              <p className="mt-2 text-sm leading-6 text-rose-700">
                {query.error instanceof Error ? query.error.message : 'Nguồn cung cấp tài liệu cho giáo viên hiện không khả dụng.'}
              </p>
            </div>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">Chưa có tài liệu cá nhân nào</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tải lên tài liệu đầu tiên của bạn từ biểu mẫu trên trang này, sau đó quay lại đây để chỉnh sửa hoặc xóa.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {documents.map((document) => {
            const isEditing = editingDocumentId === document.id;
            const isUpdating = updatingDocumentId === document.id;
            const isDeleting = deletingDocumentId === document.id;

            return (
              <article
                key={document.id}
                className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.8)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                        {document.file_type}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                        {document.id.slice(0, 8)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tiêu đề</label>
                          <input
                            value={editDraft.title}
                            onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mô tả</label>
                          <textarea
                            rows={4}
                            value={editDraft.description}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, description: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mt-4 text-2xl font-semibold text-slate-950">{document.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {document.description || 'Chưa có mô tả nào được thêm.'}
                        </p>
                      </>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 shadow-sm">Đã tạo {formatDate(document.created_at)}</span>
                      <span className="rounded-full bg-white px-3 py-1 shadow-sm">Đã cập nhật {formatDate(document.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {document.file_path ? (
                      <a
                        href={document.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
                      >
                        Mở tệp
                      </a>
                    ) : null}

                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(document.id)}
                          disabled={isUpdating}
                          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Lưu
                        </button>
                        <button
                          onClick={closeEditor}
                          disabled={isUpdating}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEditor(document)}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300"
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(document)}
                          disabled={isDeleting}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Trang {page} / {totalPages}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => startTransition(() => setPage((current) => Math.max(1, current - 1)))}
            disabled={page === 1}
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Trước
          </button>

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => startTransition(() => setPage(pageNumber))}
              className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => startTransition(() => setPage((current) => Math.min(totalPages, current + 1)))}
            disabled={page === totalPages}
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {feedback?.tone === 'success' && !query.isError && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Không gian làm việc đã đồng bộ với thao tác mới nhất của bạn.
        </div>
      )}
    </section>
  );
};
