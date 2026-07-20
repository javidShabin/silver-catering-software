import React from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-[32px] border-2 border-dashed border-rose-200">
      <div className="w-16 h-16 bg-white text-rose-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-rose-100">
        <AlertOctagon size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Something went wrong</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {error.message || "An unexpected error occurred while loading this section."}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md active:scale-95"
      >
        <RefreshCcw size={16} />
        Try Again
      </button>
    </div>
  );
};

export const GlobalErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};
