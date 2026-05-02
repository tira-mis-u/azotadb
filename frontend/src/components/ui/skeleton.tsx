import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ backgroundColor: 'var(--skeleton-bg)' }}
      className={cn("animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
