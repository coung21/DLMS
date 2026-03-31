import { BookOpen, LayoutDashboard, Upload, FileStack } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherPortalPage = () => (
  <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start pt-20">
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-10 h-10 text-emerald-500" />
        <h1 className="text-3xl font-bold text-slate-900">Cổng giáo viên</h1>
      </div>
      <p className="text-slate-600 mb-8">
        Quản lý tài liệu tải lên và tài nguyên học thuật của bạn. Theo dõi trạng thái phê duyệt của các tài liệu đã nộp.
      </p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <Link 
          to="/teacher/upload" 
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
        >
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-slate-900 text-lg">Tải lên Tài liệu</h3>
            <p className="text-sm text-slate-500">Chia sẻ tài liệu mới với thư viện.</p>
          </div>
        </Link>

        {/* Note: We should create a TeacherDocumentsPage or similar later */}
        {/* For now, we can link to a route that we will register if needed */}
        <Link 
          to="/teacher/my-documents" 
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
        >
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileStack className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-slate-900 text-lg">Tài liệu của tôi</h3>
            <p className="text-sm text-slate-500">Theo dõi trạng thái các tệp đã tải lên của bạn.</p>
          </div>
        </Link>
      </div>

      <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline mt-4">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Quay lại Trang chủ Thư viện
      </Link>
    </div>
  </div>
);
