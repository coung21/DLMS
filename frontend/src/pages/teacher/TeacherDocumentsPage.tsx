import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Trash2, 
  LayoutDashboard, 
  Image, 
  Video, 
  File, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getMyDocuments, deleteDocument } from '../../features/documents/api/documents.api';
import type { Document, DocumentType, DocumentStatus } from '../../features/documents/types';

const statusCopy: Record<DocumentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending Approval',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  deleted: {
    label: 'Deleted',
    className: 'bg-slate-100 text-slate-400 border-slate-200',
  },
};

const documentIcons: Record<DocumentType, any> = {
  pdf: FileText,
  docx: FileText,
  excel: FileText,
  text: FileText,
  image: Image,
  video: Video,
  other: File,
};

export const TeacherDocumentsPage = () => {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => getMyDocuments({ skip: 0, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      alert('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
    },
    onError: () => {
      alert('Failed to delete document');
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const documents = data?.items ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Uploaded Documents</h1>
            <p className="mt-2 text-slate-500">Manage and track the status of your shared resources.</p>
          </div>
          <Link 
            to="/teacher" 
            className="inline-flex items-center text-sm font-semibold text-slate-900 hover:underline"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Teacher Portal
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <File className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No documents yet</h3>
            <p className="mt-2 text-slate-500 text-sm">Start by uploading your first document to the library.</p>
            <Link to="/teacher/upload" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Document</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Upload Date</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc: Document) => {
                  const Icon = documentIcons[doc.file_type] || File;
                  const status = statusCopy[doc.status];
                  
                  return (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-slate-900">{doc.title}</p>
                            <p className="text-xs text-slate-500">{doc.original_file_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        {doc.status === 'rejected' && doc.review_comment && (
                           <div className="mt-1 flex items-center text-[10px] text-rose-500 font-medium">
                             <AlertCircle className="mr-1 h-3 w-3" />
                             Reason: {doc.review_comment}
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this document?')) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
