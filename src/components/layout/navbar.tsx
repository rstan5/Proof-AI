"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/cn";

const nav = [
  { label: "Benefits", href: "#benefits" },
  { label: "Process", href: "#how" },
  { label: "Product", href: "#product" },
  { label: "Report", href: "#simulation" },
];

export function Navbar() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <BrandLogo size={32} priority />
          <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            {signedIn && (
              <Link
                href="/dashboard"
                className="font-semibold text-ink transition hover:text-accent"
              >
                Dashboard
              </Link>
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-ink-muted transition hover:text-ink sm:inline"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline"
              >
                Sign in
              </Link>
            )}
            <Link
              href={
                signedIn
                  ? "/dashboard?tab=simulate"
                  : "/login?next=%2Fdashboard%3Ftab%3Dsimulate"
              }
              className={cn(
                "relative inline-flex h-9 items-center justify-center overflow-hidden rounded-lg px-3 text-xs font-semibold text-surface transition sm:px-4 sm:text-sm",
                "bg-accent shadow-[0_1px_2px_rgba(44,40,37,0.12)]",
                "hover:bg-accent-muted",
                "active:scale-[0.98]",
              )}
            >
              Generate a sample
            </Link>
          </div>
        </div>
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-border-subtle py-2.5 text-xs text-ink-muted md:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          {signedIn && (
            <Link
              href="/dashboard"
              className="shrink-0 whitespace-nowrap font-semibold text-ink"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
