import { cn } from "@/lib/utils";

/** Einheitliche Seitenbreite. `wide` nur für Bänder, die randlos wirken sollen. */
export function Container({
  className,
  wide = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        wide ? "max-w-[1440px]" : "max-w-[1180px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
