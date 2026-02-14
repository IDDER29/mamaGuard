"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentItemsCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  currentItemsCount,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6 pb-6">
      <p className="text-sm text-slate-500 mb-4 sm:mb-0">
        Page <span className="font-medium text-slate-900">{currentPage}</span> of{' '}
        <span className="font-medium text-slate-900">{totalPages}</span>
        {" "}• Viewing <span className="font-medium text-slate-900">{currentItemsCount}</span> of{' '}
        <span className="font-medium text-slate-900">{totalItems}</span>
      </p>
      <div className="flex gap-2 items-center">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          type="button"
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-500 border border-transparent rounded-lg shadow-sm hover:bg-teal-600 active:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
