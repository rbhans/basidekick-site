import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResourceCardProps {
  icon: LucideIcon;
  iconLabel: string;
  title: string;
  description: string;
  linkTo: string;
}

function ResourceCard({ icon: Icon, iconLabel, title, description, linkTo }: ResourceCardProps) {
  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 flex flex-col hover:border-[#3F3F46] transition-colors group">
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#27272A] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#C4F82A]" />
        </div>
        <span className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase">
          {iconLabel}
        </span>
      </div>
      <h3 className="font-grotesk text-[16px] font-bold text-white mb-2">
        {title}
      </h3>
      <p className="font-manrope text-[13px] text-[#A1A1AA] leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <Link
        to={linkTo}
        className="font-manrope text-[13px] font-semibold text-[#C4F82A] hover:text-[#d4ff5a] transition-colors inline-flex items-center gap-1"
      >
        Open &rarr;
      </Link>
    </div>
  );
}

export default ResourceCard;
