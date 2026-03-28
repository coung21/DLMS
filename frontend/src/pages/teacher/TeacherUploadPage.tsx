import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { TeacherUploadForm } from '../../features/documents/components/TeacherUploadForm';

export const TeacherUploadPage = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_36%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">DLMS Teacher Workspace</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Upload tài liệu cho giảng viên</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Khu vực này dành cho teacher/admin để đưa giáo trình, slide, tài liệu tham khảo lên hệ thống thư viện số.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <TeacherUploadForm />
      </div>
    </div>
  );
};
