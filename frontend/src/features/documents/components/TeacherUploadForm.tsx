import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { FileText, Loader2, Upload, BadgeInfo, BookOpen, CheckCircle2 } from 'lucide-react';
import { uploadDocument } from '../api/document.api';
import type { Document } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'txt'] as const;

const uploadSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
  category_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || z.uuid().safeParse(value).success, 'Category ID must be a valid UUID'),
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be 10MB or smaller')
    .refine((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      return allowedExtensions.includes(extension as (typeof allowedExtensions)[number]);
    }, `Supported files: ${allowedExtensions.join(', ')}`),
});

type UploadSchema = z.infer<typeof uploadSchema>;

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const detail = (error.response as { data?: { detail?: unknown } }).data?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0] as { msg?: string };
      return firstError.msg ?? 'Upload failed.';
    }
  }

  return 'Upload failed. Please try again.';
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const TeacherUploadForm = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadSchema>({
    resolver: zodResolver(uploadSchema),
  });

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: (document) => {
      setUploadedDocument(document);
      setUploadError(null);
      setSelectedFileName('');
      reset({
        title: '',
        description: '',
        category_id: '',
      });
    },
    onError: (error) => {
      setUploadError(getErrorMessage(error));
    },
  });

  const onSubmit = (data: UploadSchema) => {
    setUploadError(null);

    mutation.mutate({
      file: data.file,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      category_id: data.category_id?.trim() || undefined,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <section className="rounded-[28px] border border-emerald-100 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(5,150,105,0.45)] backdrop-blur xl:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Upload className="h-4 w-4" />
              Teacher Upload
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đăng tài liệu lên thư viện số</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Form này gọi đúng API upload hiện tại của backend bằng <code>multipart/form-data</code> với các trường
              <code> file</code>, <code>title</code>, <code>description</code> và <code>category_id</code>.
            </p>
          </div>
          <div className="hidden rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_60%)] p-5 text-emerald-700 lg:block">
            <BookOpen className="h-10 w-10" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tiêu đề tài liệu</label>
            <input
              {...register('title')}
              type="text"
              placeholder="Ví dụ: Giáo trình Toán rời rạc"
              className={`block w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                errors.title ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
              }`}
            />
            {errors.title && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category ID</label>
              <input
                {...register('category_id')}
                type="text"
                placeholder="UUID, có thể để trống"
                className={`block w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                  errors.category_id ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
                }`}
              />
              {errors.category_id ? (
                <p className="mt-1.5 text-sm font-medium text-red-500">{errors.category_id.message}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">Backend cho phép bỏ trống trường này.</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tệp tài liệu</label>
              <label
                className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3 transition ${
                  errors.file ? 'border-red-300 bg-red-50/60' : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50'
                }`}
              >
                <FileText className="h-5 w-5 shrink-0 text-emerald-700" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                  {selectedFileName || 'Chọn file PDF, DOCX, XLSX, JPG, PNG, TXT...'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Browse</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFileName(file?.name ?? '');
                    setValue('file', file as File, { shouldValidate: true });
                  }}
                />
              </label>
              {errors.file ? (
                <p className="mt-1.5 text-sm font-medium text-red-500">{errors.file.message}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">Giới hạn 10MB, đúng theo validation backend.</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mô tả</label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Mô tả ngắn về tài liệu, học phần hoặc mục đích sử dụng"
              className={`block w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                errors.description ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          {uploadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {uploadError}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {mutation.isPending ? 'Đang upload...' : 'Upload tài liệu'}
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.85)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            <BadgeInfo className="h-4 w-4" />
            API Contract
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p><strong className="text-white">Method:</strong> POST `/api/v1/documents/upload`</p>
            <p><strong className="text-white">Body:</strong> multipart/form-data</p>
            <p><strong className="text-white">Required:</strong> `file`, `title`</p>
            <p><strong className="text-white">Optional:</strong> `description`, `category_id`</p>
            <p><strong className="text-white">Extensions:</strong> {allowedExtensions.join(', ')}</p>
            <p><strong className="text-white">Size:</strong> tối đa 10MB</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6">
          <h3 className="text-lg font-bold text-slate-900">Kết quả upload</h3>
          {uploadedDocument ? (
            <div className="mt-4 space-y-3 rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">{uploadedDocument.title}</p>
                  <p className="text-sm text-slate-600">Upload thành công lúc {formatDate(uploadedDocument.created_at)}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <p><strong className="text-slate-900">ID:</strong> {uploadedDocument.id}</p>
                <p><strong className="text-slate-900">Type:</strong> {uploadedDocument.file_type}</p>
                <p><strong className="text-slate-900">Status:</strong> {uploadedDocument.status}</p>
                <p><strong className="text-slate-900">File path:</strong> {uploadedDocument.file_path ?? 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Sau khi backend trả về `DocumentResponse`, thông tin tài liệu mới sẽ hiển thị ở đây để teacher kiểm tra nhanh.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};
