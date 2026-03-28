import { BookOpen, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherPortalPage = () => (
  <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start pt-20">
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-10 h-10 text-emerald-500" />
        <h1 className="text-3xl font-bold text-slate-900">Teacher Portal</h1>
      </div>
      <p className="text-slate-600 mb-6">
        This area is for managing courses and students. Accessible to <span className="font-bold">teachers</span> and <span className="font-bold">admins</span>.
      </p>
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Back to Library Home
      </Link>
    </div>
  </div>
);
