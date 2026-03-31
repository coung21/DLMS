import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Mail, User, Users } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { getApiErrorMessage } from '../../../lib/api-error';
import { register as registerApi } from '../api/auth.api';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  role: z.enum(['student', 'teacher'], {
    message: 'Vui lòng chọn vai trò hợp lệ',
  }),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirm_password: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Mật khẩu không khớp",
  path: ['confirm_password'],
});

type RegisterSchema = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const selectedRole = useWatch({
    control,
    name: 'role',
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      const message =
        data.role === 'teacher'
          ? 'Đăng ký thành công! Tài khoản giáo viên cần được admin phê duyệt trước khi đăng nhập.'
          : 'Đăng ký thành công! Vui lòng đăng nhập.';

      navigate('/login', { state: { message } });
    },
    onError: (error: unknown) => {
      setErrorDetails(getApiErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'));
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    const { confirm_password, ...rest } = data; // remove confirm_password
    mutation.mutate(rest);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Tham gia cùng chúng tôi hôm nay và khám phá hàng ngàn cuốn sách.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Họ và tên</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-slate-600">
              <User className="h-5 w-5" />
            </div>
            <input
              {...register('full_name')}
              type="text"
              className={`block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 font-medium text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.full_name
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-slate-900/10'
              }`}
              placeholder="Nguyễn Văn A"
            />
          </div>
          {errors.full_name && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Địa chỉ email</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-slate-600">
              <Mail className="h-5 w-5" />
            </div>
            <input
              {...register('email')}
              type="email"
              className={`block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 font-medium text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-slate-900/10'
              }`}
              placeholder="ban@vidu.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bạn là...</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-slate-600">
              <Users className="h-5 w-5" />
            </div>
            <select
              {...register('role')}
              className={`block w-full appearance-none rounded-xl border bg-white py-2.5 pl-11 pr-10 font-medium text-slate-900 transition-all focus:outline-none focus:ring-4 ${
                errors.role
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-slate-900/10'
              }`}
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giáo viên</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.role && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.role.message}
            </p>
          )}
          {selectedRole === 'teacher' && (
            <p className="mt-1.5 flex items-center gap-1 animate-in fade-in text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Tài khoản giáo viên cần được admin phê duyệt trước khi đăng nhập.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-slate-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register('password')}
              type="password"
              className={`block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 font-medium text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-slate-900/10'
              }`}
              placeholder="********"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-slate-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register('confirm_password')}
              type="password"
              className={`block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 font-medium text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                errors.confirm_password
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-slate-900/10'
              }`}
              placeholder="********"
            />
          </div>
          {errors.confirm_password && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        {errorDetails && (
          <div className="animate-in fade-in flex items-start rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            <div className="mr-2 mt-0.5 shrink-0">
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {errorDetails}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 flex w-full justify-center rounded-xl border border-transparent bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng ký'}
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-slate-900 transition-colors hover:text-slate-700">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};
