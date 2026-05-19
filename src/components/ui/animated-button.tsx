import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

export function AnimatedButton({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-lg px-5 text-sm font-semibold transition will-change-transform active:scale-[0.98]";

  const variants = {
    primary: cn(
      "text-surface",
      "bg-accent shadow-[0_1px_2px_rgba(44,40,37,0.12)]",
      "hover:bg-accent-muted",
    ),
    secondary: cn(
      "text-ink",
      "border border-border bg-surface/90 shadow-sm",
      "hover:border-accent/25 hover:bg-surface",
    ),
    ghost: cn(
      "text-ink-muted hover:text-ink hover:bg-surface-overlay/80",
    ),
  };

  return (
    <Link
      {...props}
      className={cn("group", base, variants[variant], className)}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
