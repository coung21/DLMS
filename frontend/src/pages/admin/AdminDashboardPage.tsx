import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Back to Library Home
      </Link>
    </div>
  </div>
);
