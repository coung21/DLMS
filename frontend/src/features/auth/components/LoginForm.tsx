import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, getProfile } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

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

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginSchema) => {
      const authResponse = await login(data);
      // Temporarily set token in axios and store before getting profile
      useAuthStore.getState().setAuth(authResponse.access_token, null as any);
      const user = await getProfile();
      return { token: authResponse.access_token, user };
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' 
        ? detail 
        : Array.isArray(detail) 
          ? detail[0]?.msg || JSON.stringify(detail[0])
          : typeof detail === 'object' && detail !== null
            ? detail.msg || JSON.stringify(detail)
            : 'Login failed. Please check your credentials.';
      
      setErrorDetails(message);
      // remove invalid partial auth
      useAuthStore.getState().logout();
    },
  });

  const onSubmit = (data: LoginSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <input
              {...register('email')}
              type="email"
              className={`block w-full pl-11 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all bg-white font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-sm text-red-500 font-medium animate-in fade-in">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              {...register('password')}
              type="password"
              className={`block w-full pl-11 pr-3 py-2.5 border ${errors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all bg-white font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="mt-1.5 text-sm text-red-500 font-medium animate-in fade-in">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 font-medium">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        {errorDetails && (
          <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start animate-in fade-in">
             <div className="shrink-0 mr-2 mt-0.5">
                <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
             </div>
            {errorDetails}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {mutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
        </button>

        <p className="text-center text-sm text-slate-600 mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
            Sign up now
          </Link>
        </p>
      </form>
    </div>
  );
};
