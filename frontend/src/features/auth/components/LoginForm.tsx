import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { getApiErrorMessage } from '../../../lib/api-error';
import { useAuthStore } from '../../../store/authStore';
import { getProfile, login } from '../api/auth.api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginSchema) => {
      const authResponse = await login(data);
      useAuthStore.getState().setToken(authResponse.access_token);

      const user = await getProfile();

      return { token: authResponse.access_token, user };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate(from, { replace: true });
    },
    onError: (error: unknown) => {
      setErrorDetails(getApiErrorMessage(error, 'Login failed. Please check your credentials.'));
      useAuthStore.getState().logout();
    },
  });

  const onSubmit = (data: LoginSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent">
          Welcome back
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Please enter your details to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
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
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 animate-in fade-in text-sm font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-semibold text-slate-900 transition-colors hover:text-slate-700">
              Forgot password?
            </a>
          </div>
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
          className="flex w-full justify-center rounded-xl border border-transparent bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In'}
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 transition-colors hover:text-slate-700">
            Sign up now
          </Link>
        </p>
      </form>
    </div>
  );
};
