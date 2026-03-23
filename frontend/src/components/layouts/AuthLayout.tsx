import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2670&auto=format&fit=crop"
            alt="Library Architecture"
            className="object-cover w-full h-full opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 text-white px-12 max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-library"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
            Digital Library Management
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-light">
            Access thousands of books, journals, and articles anywhere, anytime. Join our community of readers.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white/80 backdrop-blur-3xl border-l border-slate-200/50">
        <div className="w-full max-w-sm space-y-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
