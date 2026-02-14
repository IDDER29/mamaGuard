interface SectionHeaderProps {
  id: string;
  title: string;
  icon: string;
  variant: "critical" | "warning" | "success";
}

const VARIANT_STYLES = {
  critical: {
    iconColor: "text-red-500",
    titleColor: "text-red-500",
    lineColor: "bg-red-500/20",
  },
  warning: {
    iconColor: "text-amber-500",
    titleColor: "text-amber-500",
    lineColor: "bg-amber-500/20",
  },
  success: {
    iconColor: "text-green-500",
    titleColor: "text-green-500",
    lineColor: "bg-green-500/20",
  },
} as const;

export default function SectionHeader({ 
  id, 
  title, 
  icon, 
  variant 
}: SectionHeaderProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <div className="mb-4 flex items-center gap-2" role="presentation">
      <span 
        className={`material-symbols-outlined ${colors.iconColor} text-lg`} 
        aria-hidden="true"
      >
        {icon}
      </span>
      <h2 
        id={id} 
        className={`text-sm font-bold ${colors.titleColor} uppercase tracking-wide`}
      >
        {title}
      </h2>
      <div 
        className={`h-px ${colors.lineColor} flex-1 ml-2`} 
        aria-hidden="true"
      />
    </div>
  );
}
