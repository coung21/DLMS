import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Upload, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getApiErrorMessage } from '../../../lib/api-error';
import { uploadDocument } from '../api/document.api';
import { getCategories } from '../../categories/api/categories.api';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'txt'] as const;

const uploadSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề'),
  description: z.string().max(1000, 'Mô tả quá dài').optional().or(z.literal('')),
  category_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || z.uuid().safeParse(value).success, 'ID Danh mục phải là mã UUID hợp lệ'),
  file: z
    .instanceof(File, { message: 'Vui lòng chọn tệp' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Kích thước tệp không được vượt quá 10MB')
    .refine((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      return allowedExtensions.includes(extension as (typeof allowedExtensions)[number]);
    }, `Tệp được hỗ trợ: ${allowedExtensions.join(', ')}`),
});

type UploadSchema = z.infer<typeof uploadSchema>;


export const TeacherUploadForm = () => {
  const queryClient = useQueryClient();
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UploadSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category_id: '',
    },
  });

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
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
      setUploadError(getApiErrorMessage(error, 'Tải lên thất bại. Vui lòng thử lại.'));
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
          Tải lên tài liệu mới
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Xuất bản tài liệu lên thư viện</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Biểu mẫu này tải tệp lên server và tự động ghi nhận giáo viên đang đăng nhập là người tải lên.
            </p>
          </div>

          <div className="rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_70%)] p-5 text-emerald-700">
            <FileText className="h-10 w-10" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tiêu đề tài liệu</label>
          <input
            {...register('title')}
            type="text"
            placeholder="Ví dụ: Bài giảng Toán rời rạc 03"
            className={`block w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
              errors.title ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
            }`}
          />
          {errors.title && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.title.message}</p>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Danh mục</label>
            <div className="relative group">
              <select
                {...register('category_id')}
                disabled={isLoadingCategories}
                className={`block w-full appearance-none rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-4 pr-10 ${
                  errors.category_id ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-emerald-100'
                } ${isLoadingCategories ? 'animate-pulse bg-slate-50' : 'bg-white'}`}
              >
                <option value="">Không có / Chưa phân loại</option>
                {categoriesData?.items.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            {errors.category_id ? (
              <p className="mt-1.5 text-sm font-medium text-red-500">{errors.category_id.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                {isLoadingCategories ? 'Đang tải danh mục...' : 'Chọn thư mục hoặc danh mục cho tài liệu của bạn.'}
              </p>
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
                {selectedFileName || 'Chọn tệp PDF, DOCX, XLSX, JPG, PNG hoặc TXT'}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Duyệt</span>
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
              <p className="mt-1.5 text-xs text-slate-500">Kích thước tệp tối đa là 10MB.</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mô tả</label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Tóm tắt nội dung tài liệu, khóa học hoặc mục đích sử dụng."
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
          {mutation.isPending ? 'Đang tải lên...' : 'Tải lên tài liệu'}
        </button>
      </form>
    </section>
  );
};
