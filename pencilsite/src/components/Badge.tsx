import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  label: string;
  icon?: LucideIcon;
}

function Badge({ label, icon: Icon }: BadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C4F82A] bg-transparent">
      {Icon && <Icon className="w-3.5 h-3.5 text-[#C4F82A]" />}
      <span className="font-mono text-[12px] font-bold text-[#C4F82A] tracking-[2px] uppercase">
        {label}
      </span>
    </div>
  );
}

export default Badge;
