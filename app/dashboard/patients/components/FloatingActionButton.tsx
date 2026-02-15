interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-teal-500/30 flex items-center justify-center z-50 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 ease-out cursor-pointer"
      aria-label="Add new patient"
    >
      <span className="material-symbols-outlined text-2xl font-bold">add</span>
    </button>
  );
}
