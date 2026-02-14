import { ReactNode } from "react";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this content. Please try again.",
  retry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-red-500 text-3xl" aria-hidden="true">
          error
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = "inbox", title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-slate-400 text-3xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {message && <p className="text-sm text-slate-600 mb-6 max-w-md">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
