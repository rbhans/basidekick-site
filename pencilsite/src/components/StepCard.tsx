interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
}

function StepCard({ stepNumber, title, description }: StepCardProps) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#C4F82A] flex items-center justify-center shrink-0">
        <span className="font-grotesk text-[14px] font-bold text-[#0A0A0A]">
          {stepNumber}
        </span>
      </div>
      <div>
        <h4 className="font-grotesk text-[14px] font-bold text-white mb-1">
          {title}
        </h4>
        <p className="font-manrope text-[12px] text-[#A1A1AA] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default StepCard;
