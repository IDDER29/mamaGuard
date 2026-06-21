import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary text-white rounded-2xl shadow-glow flex items-center justify-center z-50 hover:bg-primary/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ease-out cursor-pointer"
      aria-label="Add new patient"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
