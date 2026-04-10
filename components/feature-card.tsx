import { cn } from "@/lib/utils";
import { HoverLift } from "@/components/motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <HoverLift>
      <div
        className={cn(
          "p-5 border border-border rounded-md bg-card hover:border-foreground transition-all",
          className
        )}
      >
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
            {icon}
          </div>
        )}
        <h4 className="font-heading text-[14px] font-bold text-foreground">
          {title}
        </h4>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </HoverLift>
  );
}
