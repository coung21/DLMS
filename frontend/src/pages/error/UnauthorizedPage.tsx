import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
            <div className="absolute top-0 right-0 w-6 h-6 bg-red-100 border-4 border-white rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Truy cập bị từ chối</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 mr-2" />
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
