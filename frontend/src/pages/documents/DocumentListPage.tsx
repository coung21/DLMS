import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  Image,
  type LucideIcon,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Video,
  Search,
} from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getDocuments, getDocumentPreviewUrl /*, getDocumentDownloadUrl*/ } from '../../features/documents/api/documents.api';
import { getCategories } from '../../features/categories/api/categories.api';
import type {
  DocumentItem,
  DocumentType,
} from '../../features/documents/types';
import { useAuthStore } from '../../store/authStore';

const PAGE_SIZE = 6;

const statusCopy = {
  pending: {
    label: 'Đang chờ duyệt',
    className: 'border border-amber-200 bg-amber-50 text-amber-700',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  rejected: {
    label: 'Từ chối',
    className: 'border border-rose-200 bg-rose-50 text-rose-700',
  },
  archived: {
    label: 'Lưu trữ',
    className: 'border border-slate-200 bg-slate-50 text-slate-700',
  },
  deleted: {
    label: 'Đã xóa',
    className: 'border border-slate-200 bg-slate-50 text-slate-700',
  },
};

const typeCopy: Record<DocumentType, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  excel: 'Excel',
  text: 'Text',
  image: 'Hình ảnh',
  video: 'Video',
  other: 'Khác',
};

const documentIcons: Record<DocumentType, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  excel: FileText,
  text: FileText,
  image: Image,
  video: Video,
  other: File,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const buildPageNumbers = (page: number, totalPages: number) => {
  const maxVisiblePages = 5;
  const start = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));
  const end = Math.min(totalPages, start + maxVisiblePages - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const DocumentCard = ({ document }: { document: DocumentItem }) => {
  const Icon = documentIcons[document.file_type];
  const status = statusCopy[document.status];
  const [isOpening, setIsOpening] = useState(false);
  // const [isDownloading, setIsDownloading] = useState(false);

  const handleOpenPreview = async () => {
    if (!document.file_path || isOpening) return;

    setIsOpening(true);
    try {
      const url = await getDocumentPreviewUrl(document.id);
      window.open(url, '_blank', 'noreferrer');
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      alert('Không thể mở bản xem trước. Vui lòng thử lại sau.');
    } finally {
      setIsOpening(false);
    }
  };

  // const handleDownload = async () => {
  //   if (!document.file_path || isDownloading) return;

  //   setIsDownloading(true);
  //   try {
  //     const url = await getDocumentDownloadUrl(document.id);
  //     // Create a temporary link and click it to trigger download
  //     const link = window.document.createElement('a');
  //     link.href = url;
  //     // We don't strictly need link.download here because the backend sets Content-Disposition,
  //     // but it doesn't hurt as a hint if the browser supports it for cross-origin.
  //     link.setAttribute('download', document.original_file_name || document.title);
  //     window.document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error('Failed to get download URL:', error);
  //     alert('Không thể bắt đầu tải xuống. Vui lòng thử lại sau.');
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] transition-transform duration-200 hover:-translate-y-1 hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
          <Icon className="h-6 w-6" />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          {typeCopy[document.file_type]}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{document.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {document.description || 'Chưa có mô tả nào được thêm.'}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Cập nhật {formatDate(document.updated_at)}
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
          Tạo lúc {formatDate(document.created_at)}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
          {document.id.slice(0, 8)}
        </p>
        <div className="flex gap-2">
          {document.file_path ? (
            <>
              {/* Nút Download tạm thời bị vô hiệu hoá để tránh lỗi Mixed Content */}
              {/* <button
                onClick={handleDownload}
                disabled={isDownloading || isOpening}
                title="Tải tệp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                )}
              </button> */}
              <button
                onClick={handleOpenPreview}
                disabled={isOpening}
                className="inline-flex h-9 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
              >
                {isOpening ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                {isOpening ? 'Đang tải...' : 'Mở tệp'}
              </button>
            </>
          ) : (
            <span className="rounded-full border border-dashed border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400">
              Tệp không khả dụng
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export const DocumentListPage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchParams, setSearchParams] = useSearchParams();

  // DERIVED STATE FROM URL
  const searchQueryParam = searchParams.get('search') ?? '';
  const activeCategoryId = searchParams.get('category');
  const sortBy = searchParams.get('sort') ?? 'created_at_desc';
  const rawPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const skip = (page - 1) * PAGE_SIZE;

  // LOCAL STATE FOR RESPONSIVE SEARCH INPUT
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);

  // Helper to update URL params
  const updateParams = (updates: Record<string, string | null>, replace = false) => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '' || (key === 'page' && value === '1')) {
            nextParams.delete(key);
          } else {
            nextParams.set(key, value);
          }
        });
        return nextParams;
      },
      { replace },
    );
  };

  // Debounce search query to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchQueryParam) {
        updateParams({ search: searchQuery, page: '1' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchQueryParam]);

  // Keep local search query in sync if URL changes externally (e.g. back button)
  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  // Categories query
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categories = categoriesQuery.data?.items ?? [];

  const query = useQuery({
    queryKey: ['documents', page, searchQueryParam, activeCategoryId, sortBy],
    queryFn: () => getDocuments({
      skip,
      limit: PAGE_SIZE,
      search: searchQueryParam || undefined,
      categoryId: activeCategoryId,
      sortBy
    }),
    placeholderData: keepPreviousData,
  });

  const documents = query.data?.items ?? [];
  const totalDocuments = query.data?.total ?? 0;

  const effectiveTotal = totalDocuments;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const visiblePages = buildPageNumbers(page, totalPages);

  const currentStart = effectiveTotal === 0 ? 0 : skip + 1;
  const currentEnd = effectiveTotal === 0 ? 0 : skip + documents.length;
  const availableCount = documents.filter((document) => document.status === 'approved').length;

  const updatePage = (nextPage: number, replace = false) => {
    const normalizedPage = Math.max(1, Math.min(nextPage, totalPages));
    updateParams({ page: String(normalizedPage) }, replace);
  };

  useEffect(() => {
    if (query.data && totalDocuments > 0 && page > totalPages) {
      updateParams({ page: String(totalPages) }, true);
    }
  }, [page, query.data, totalDocuments, totalPages]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#f8fafc_52%,#edf3f8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_38%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(30,41,59,0.92)_50%,_rgba(15,118,110,0.88)_100%)] p-6 text-white shadow-[0_28px_90px_-50px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100/80">
                  Thư viện số
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                  Tài liệu chọn lọc dành cho sinh viên và giảng viên.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                  Duyệt tìm tài nguyên số, khám phá các nội dung tải lên gần đây, và xem qua từng trang bộ sưu tập mà không bị mất ngữ cảnh.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Đăng nhập dưới tên
                  </p>
                  <p className="mt-1 text-lg font-semibold">{user?.full_name || 'Người dùng thư viện'}</p>
                  <p className="text-sm text-slate-300">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Tổng số tài liệu
                </p>
                <p className="mt-3 text-3xl font-semibold">{totalDocuments}</p>
                <p className="mt-1 text-sm text-slate-300">Trong toàn thư viện</p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Tài liệu trên trang
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {currentStart}-{currentEnd}
                </p>
                <p className="mt-1 text-sm text-slate-300">Mục đang hiển thị</p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Khả dụng trên trang
                </p>
                <p className="mt-3 text-3xl font-semibold">{availableCount}</p>
                <p className="mt-1 text-sm text-slate-300">Sẵn sàng truy cập ngay</p>
              </div>
            </div>
          </div>
        </header>

        <main className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-[32px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Chế độ xem bộ sưu tập
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Danh sách tài liệu</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Hiển thị {currentStart}-{currentEnd} trên tổng số {totalDocuments} tài liệu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0 items-center justify-start sm:justify-end">
                <div className="relative flex-1 sm:flex-none sm:w-64 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                    placeholder="Tìm kiếm tài liệu..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e: any) => updateParams({ sort: e.target.value, page: '1' })}
                  className="rounded-full border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                >
                  <option value="created_at_desc">Mới nhất trước</option>
                  <option value="created_at_asc">Cũ nhất trước</option>
                  <option value="title_asc">Tiêu đề A-Z</option>
                  <option value="title_desc">Tiêu đề Z-A</option>
                </select>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-900 hover:text-rose-900"
                >
                  <span className="">Bỏ lọc</span>
                </button>
                <button
                  onClick={() => query.refetch()}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
                >
                  {query.isFetching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <span
                onClick={() => updateParams({ category: null, page: '1' })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-colors whitespace-nowrap ${null === activeCategoryId ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'}`}
              >
                Tất cả danh mục
              </span>
              {categories.map((cat: { id: string, name: string }) => (
                <span
                  key={cat.id}
                  onClick={() => updateParams({ category: cat.id, page: '1' })}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-colors whitespace-nowrap ${cat.id === activeCategoryId ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'}`}
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {query.isLoading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#eef2f7)]"
                  />
                ))}
              </div>
            ) : query.isError ? (
              <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-rose-800">Không thể tải tài liệu</h3>
                    <p className="mt-2 text-sm leading-6 text-rose-700">
                      {query.error instanceof Error
                        ? query.error.message
                        : 'Dịch vụ tài liệu không trả về dữ liệu.'}
                    </p>
                    <button
                      onClick={() => query.refetch()}
                      className="mt-4 inline-flex items-center rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Chưa có tài liệu nào</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bắt đầu tải lên tài liệu và chúng sẽ xuất hiện ở đây với tính năng phân trang.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {documents.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Trang {page} / {totalPages}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </button>

                {visiblePages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => updatePage(pageNumber)}
                    className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition-colors ${pageNumber === page
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                      }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => updatePage(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tiếp
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Hồ sơ người đọc
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-slate-900">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{user?.full_name || 'User'}</p>
                  <p className="text-sm text-slate-500 capitalize">
                    {user?.role || 'member'} / {user?.status || 'active'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.4)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Truy cập nhanh
              </p>
              <div className="mt-4 space-y-3">
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                  <Link
                    to="/teacher"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <span className="inline-flex items-center">
                      <BookOpen className="mr-3 h-4 w-4" />
                      Không gian giáo viên
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700"
                  >
                    <span className="inline-flex items-center">
                      <ShieldCheck className="mr-3 h-4 w-4" />
                      Khu vực quản trị
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
