import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-800 mb-6 text-2xl font-bold">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.full_name || 'User'}!</h1>
        <p className="text-slate-500 mb-8">You have successfully authenticated into the DLMS system.</p>
        
        <div className="grid grid-cols-2 gap-4 text-left mb-8">
          <div className="p-4 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Role</p>
            <p className="font-medium text-slate-900 capitalize">{user?.role || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Status</p>
            <p className="font-medium text-slate-900 capitalize">{user?.status || 'N/A'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 shadow-sm text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
]);
