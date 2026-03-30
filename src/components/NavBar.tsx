"use client";

import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/blog",         label: "Blogg" },
  { href: "/faq",          label: "FAQ" },
  { href: "/kontakt",      label: "Kontakt" },
  { href: "/om-oss",       label: "Om oss" },
];

// Mobile-only: all links including city pages
const mobileLinks = [
  { href: "/by/oslo",         label: "Oslo" },
  { href: "/by/bergen",       label: "Bergen" },
  { href: "/by/trondheim",    label: "Trondheim" },
  { href: "/by/stavanger",    label: "Stavanger" },
  { href: "/by/baerum",       label: "Bærum" },
  { href: "/by/kristiansand", label: "Kristiansand" },
  { href: "/blog",            label: "Blogg" },
  { href: "/faq",             label: "FAQ" },
  { href: "/kontakt",         label: "Kontakt" },
  { href: "/om-oss",          label: "Om oss" },
  { href: "/for/forstegangskjoper", label: "Førstegangskjøper" },
  { href: "/for/boliginvestor",     label: "Boliginvestor" },
  { href: "/for/barnefamilier",     label: "Barnefamilie" },
  { href: "/presse",               label: "Presse" },
  { href: "/changelog",            label: "Endringslogg" },
];

const CTA_HREF = "/#sok";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Logo className="h-8 w-8 shrink-0 logo-pulse" />
          <span className="hidden font-bold text-lg tracking-tight text-foreground sm:block">
            Verdikart
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 text-sm text-text-secondary sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link whitespace-nowrap transition-colors hover:text-foreground ${
                pathname === href ? "text-foreground font-medium nav-link-active" : ""
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Primary CTA */}
          <Link
            href="/#sok"
            className="ml-1 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 whitespace-nowrap"
          >
            Prøv nå →
          </Link>
        </div>

        {/* Mobile CTA */}
        <Link
          href={CTA_HREF}
          className="mr-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 sm:hidden"
        >
          Prøv nå
        </Link>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-card-bg text-text-secondary transition-colors hover:text-foreground sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Lukk meny" : "Åpne meny"}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-4.5 w-4.5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-4.5 w-4.5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-card-border bg-background/95 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col divide-y divide-card-border">
            {mobileLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-6 py-4 text-sm transition-colors hover:bg-card-bg hover:text-foreground ${
                  pathname === href
                    ? "text-accent font-medium"
                    : "text-text-secondary"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
