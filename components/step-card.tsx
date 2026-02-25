import { cn } from "@/lib/utils";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  className?: string;
}

export function StepCard({ number, title, description, className }: StepCardProps) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono text-sm font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-heading text-[14px] font-bold text-foreground">
          {title}
        </h4>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
