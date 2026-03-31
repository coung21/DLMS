import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeInfo, CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getApiErrorMessage } from '../../../lib/api-error';
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const TeacherUploadForm = () => {
  const queryClient = useQueryClient();
  const [selectedFileName, setSelectedFileName] = useState('');
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
      queryClient.invalidateQueries({ queryKey: ['teacher-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      reset({
        title: '',
        description: '',
        category_id: '',
      });
    },
    onError: (error) => {
      setUploadError(getApiErrorMessage(error, 'Upload failed. Please try again.'));
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
    <section className="rounded-[28px] border border-emerald-100 bg-white/96 p-6 shadow-[0_28px_90px_-60px_rgba(5,150,105,0.55)] xl:p-8">
      <div className="flex flex-col gap-4 border-b border-emerald-100 pb-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          <Upload className="h-4 w-4" />
          Upload new material
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Publish a document to the library</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              This form sends the current backend contract with <code>multipart/form-data</code> and attaches the
              logged-in teacher as the uploader automatically.
            </p>
          </div>

          <div className="rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_70%)] p-5 text-emerald-700">
            <FileText className="h-10 w-10" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Document title</label>
          <input
            {...register('title')}
            type="text"
            placeholder="Example: Discrete Mathematics Lecture 03"
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
              placeholder="Optional UUID"
              className={`block w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                errors.category_id ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
              }`}
            />
            {errors.category_id ? (
              <p className="mt-1.5 text-sm font-medium text-red-500">{errors.category_id.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">Leave empty if the document does not belong to a category yet.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Document file</label>
            <label
              className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3 transition ${
                errors.file ? 'border-red-300 bg-red-50/60' : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50'
              }`}
            >
              <FileText className="h-5 w-5 shrink-0 text-emerald-700" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                {selectedFileName || 'Choose PDF, DOCX, XLSX, JPG, PNG, or TXT'}
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
              <p className="mt-1.5 text-xs text-slate-500">Maximum file size is 10MB.</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Summarize the document content, course, or intended usage."
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
          {mutation.isPending ? 'Uploading...' : 'Upload document'}
        </button>
      </form>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-slate-50">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            <BadgeInfo className="h-4 w-4" />
            API contract
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p><strong className="text-white">Method:</strong> POST `/api/v1/documents/upload`</p>
            <p><strong className="text-white">Body:</strong> multipart/form-data</p>
            <p><strong className="text-white">Required:</strong> `file`, `title`</p>
            <p><strong className="text-white">Optional:</strong> `description`, `category_id`</p>
            <p><strong className="text-white">Extensions:</strong> {allowedExtensions.join(', ')}</p>
            <p><strong className="text-white">Size:</strong> up to 10MB</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-5">
          <h3 className="text-lg font-bold text-slate-900">Latest upload result</h3>
          {uploadedDocument ? (
            <div className="mt-4 space-y-3 rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">{uploadedDocument.title}</p>
                  <p className="text-sm text-slate-600">Uploaded at {formatDate(uploadedDocument.created_at)}</p>
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
              After the backend returns `DocumentResponse`, the most recent upload will appear here for a quick confirmation.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
