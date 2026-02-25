import { Link } from 'react-router-dom';

interface ArticleCardProps {
  category: string;
  title: string;
  description: string;
  readTime: string;
  accentColor?: string;
}

function ArticleCard({
  category,
  title,
  description,
  readTime,
  accentColor = '#C4F82A',
}: ArticleCardProps) {
  return (
    <Link
      to="/wiki"
      className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#3F3F46] transition-colors group flex flex-col"
    >
      <div className="h-[3px] w-full" style={{ background: accentColor }} />
      <div className="p-5 flex flex-col flex-1">
        <span className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase mb-2">
          {category}
        </span>
        <h3 className="font-grotesk text-[15px] font-bold text-white mb-2 group-hover:text-[#C4F82A] transition-colors leading-snug">
          {title}
        </h3>
        <p className="font-manrope text-[12px] text-[#A1A1AA] leading-relaxed mb-3 flex-1">
          {description}
        </p>
        <span className="font-manrope text-[11px] text-[#52525B]">
          {readTime}
        </span>
      </div>
    </Link>
  );
}

export default ArticleCard;
