import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { TeacherUploadPage } from '../pages/teacher/TeacherUploadPage';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { UnauthorizedPage } from '../pages/error/UnauthorizedPage';
import { NotFoundPage } from '../pages/error/NotFoundPage';
import { useAuthStore } from '../store/authStore';
import { LogOut, ShieldCheck, BookOpen, LayoutDashboard, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-800 mb-6 text-2xl font-bold">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.full_name || 'User'}!</h1>
        <p className="text-slate-500 mb-6">Explore the digital library catalog.</p>
        
        {/* Mock Filter UI */}
        <div className="w-full mb-8 text-left">
          <div className="flex gap-3 w-full mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books, authors, or topics..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>
            <button className="flex items-center justify-center px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5 sm:mr-2" />
              <span className="font-medium hidden sm:inline">Filters</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All Categories', 'Textbooks', 'Fiction', 'Science', 'History'].map(filter => (
              <span key={filter} className={`px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-colors whitespace-nowrap ${filter === 'All Categories' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {filter}
              </span>
            ))}
          </div>
        </div>

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

        <div className="flex flex-col gap-3 mb-8">
          <Link to="/admin" className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mr-3" />
            <span className="font-medium text-slate-700">Admin Area</span>
          </Link>
          <Link to="/teacher" className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <BookOpen className="w-5 h-5 text-emerald-500 mr-3" />
            <span className="font-medium text-slate-700">Teacher Portal</span>
          </Link>
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

const AdminDashboard = () => (
  <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start pt-20">
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <ShieldCheck className="w-10 h-10 text-indigo-500" />
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
      </div>
      <p className="text-slate-600 mb-6">This area is highly restricted. Only users with the <span className="font-bold">admin</span> role can see this page.</p>
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
    </div>
  </div>
);

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
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <TeacherUploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
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
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
