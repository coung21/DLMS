import { LayoutDashboard, LibraryBig } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TeacherDocumentManager } from '../../features/documents/components/TeacherDocumentManager';
import { TeacherUploadForm } from '../../features/documents/components/TeacherUploadForm';

export const TeacherUploadPage = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_34%,#fff7ed_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.97),_rgba(30,41,59,0.92)_52%,_rgba(12,74,110,0.88)_100%)] p-6 text-white shadow-[0_28px_90px_-52px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/80">Teacher workspace</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                Manage the documents you personally publish to the digital library.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Upload new resources, keep titles and descriptions accurate, and remove outdated files without leaving the
                same page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <div className="rounded-3xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-200">
                  <LibraryBig className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Personal library control</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-200">
                  Every edit and delete action is scoped to documents uploaded by the current teacher account.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to library
              </Link>
            </div>
          </div>
        </header>

        <main className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <TeacherUploadForm />
          <TeacherDocumentManager />
        </main>
      </div>
    </div>
  );
};
