import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors">
      <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#C4F82A]" />
      </div>
      <h4 className="font-grotesk text-[14px] font-bold text-white mb-1.5">
        {title}
      </h4>
      <p className="font-manrope text-[12px] text-[#A1A1AA] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
