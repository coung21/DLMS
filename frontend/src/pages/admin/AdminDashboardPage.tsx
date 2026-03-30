import { LayoutDashboard, ShieldCheck, Users, FolderTree, ClipboardCheck } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export const AdminDashboardPage = () => (
  <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start pt-20">
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <ShieldCheck className="w-10 h-10 text-indigo-500" />
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
      </div>
      <p className="text-slate-600 mb-6">
        This area is highly restricted. Only users with the <span className="font-bold">admin</span> role can see this page.
      </p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <Link 
          to="/admin/users" 
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
        >
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-slate-900 text-lg">User Management</h3>
            <p className="text-sm text-slate-500">Manage user accounts, roles, and status.</p>
          </div>
        </Link>

        <Link 
          to="/admin/categories" 
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
        >
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FolderTree className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-slate-900 text-lg">Category Management</h3>
            <p className="text-sm text-slate-500">Create and organize document categories.</p>
          </div>
        </Link>
        <Link 
          to="/admin/documents-review" 
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all group"
        >
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-slate-900 text-lg">Document Review</h3>
            <p className="text-sm text-slate-500">Approve or reject documents uploaded by teachers.</p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <Outlet />
      </div>

      <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline mt-6">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Back to Library Home
      </Link>
    </div>
  </div>
);
