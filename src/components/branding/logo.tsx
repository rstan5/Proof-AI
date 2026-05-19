import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

const LOGO_SRC = "/logo.png";

type LogoMarkProps = {
  size: number;
  className?: string;
  priority?: boolean;
  /** When true, hide from assistive tech (wordmark or heading provides the name). */
  decorative?: boolean;
};

/** Square mark only (white “P” on black) — use next to wordmarks or in footers. */
export function LogoMark({
  size,
  className,
  priority,
  decorative,
}: LogoMarkProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt={decorative ? "" : "Proof AI"}
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-md shadow-sm ring-1 ring-black/15",
        className,
      )}
      priority={priority}
      sizes={`${size}px`}
      aria-hidden={decorative ? true : undefined}
    />
  );
}

type BrandLogoProps = {
  className?: string;
  /** Default 32px — matches previous nav mark. */
  size?: number;
  showWordmark?: boolean;
  priority?: boolean;
};

/** Home link with logo and optional “Proof AI” label. */
export function BrandLogo({
  className,
  size = 32,
  showWordmark = true,
  priority = false,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label={showWordmark ? undefined : "Proof AI home"}
      className={cn(
        "flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-ink transition hover:text-accent",
        className,
      )}
    >
      <LogoMark size={size} priority={priority} decorative={showWordmark} />
      {showWordmark ? (
        <span className="truncate font-serif text-[15px] sm:text-base">
          Proof AI
        </span>
      ) : null}
    </Link>
  );
}
