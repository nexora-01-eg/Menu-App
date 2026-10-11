import { cn } from "@/lib/utils";

interface AppPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AppPageHeader({ title, description, action, className }: AppPageHeaderProps) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-center justify-between gap-4", className)}>
      <div>
        <h2 className="font-display text-[23px] font-medium">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
