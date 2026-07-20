import Link from "next/link";
import { LogoMark } from "@/components/branding/logo";

const footer = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  {
    label: "Contact",
    href: "mailto:contact.proof.ai@gmail.com?subject=Proof%20AI%20inquiry",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <LogoMark size={32} decorative />
          <div>
            <p className="font-serif text-sm font-semibold text-ink">Proof AI</p>
            <p className="text-xs text-ink-muted">
              Competency work samples — not interview replacements.
            </p>
          </div>
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          {footer.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-ink-faint sm:text-right">
          © {new Date().getFullYear()} Proof AI. All rights reserved.
        </p>
      </div>
      <div className="mx-auto max-w-6xl border-t border-border-subtle px-4 py-4 sm:px-6">
        <p className="text-center text-[11px] leading-relaxed text-ink-faint">
          Proof AI shows how candidates think through role-like work. It does
          not replace interviews, licensing, or human judgment — and it measures
          competency, not claimed expertise. Pricing:{" "}
          <a
            href="mailto:contact.proof.ai@gmail.com?subject=Proof%20AI%20pricing"
            className="underline decoration-border-subtle underline-offset-2 hover:text-ink-muted"
          >
            contact.proof.ai@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
