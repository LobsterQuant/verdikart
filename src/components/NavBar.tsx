"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Menu, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/blogg",         label: "Blogg" },
  { href: "/faq",          label: "FAQ" },
  { href: "/om-oss",       label: "Om oss" },
  { href: "/kontakt",      label: "Kontakt" },
];

const toolLinks = [
  { href: "/sammenlign-adresser", label: "Sammenlign adresser", desc: "To adresser side ved side" },
  { href: "/sammenlign",          label: "Sammenlign byer",     desc: "Norges største byer sammenlignet" },
  { href: "/kalkulator",          label: "Boligkalkulator",     desc: "Hva har du råd til?" },
  { href: "/bykart",              label: "Bykart",              desc: "Priser per norsk by" },
];

// Mobile-only: all links including city pages
const mobileLinks = [
  { href: "/sammenlign-adresser", label: "Sammenlign adresser" },
  { href: "/sammenlign",           label: "Sammenlign byer" },
  { href: "/kalkulator",      label: "Boligkalkulator" },
  { href: "/bykart",          label: "Bykart" },
  { href: "/by/oslo",         label: "Oslo" },
  { href: "/by/bergen",       label: "Bergen" },
  { href: "/by/trondheim",    label: "Trondheim" },
  { href: "/by/stavanger",    label: "Stavanger" },
  { href: "/nabolag/frogner", label: "Frogner" },
  { href: "/nabolag/grunerlokka", label: "Grünerløkka" },
  { href: "/blogg",            label: "Blogg" },
  { href: "/faq",             label: "FAQ" },
  { href: "/om-oss",          label: "Om oss" },
  { href: "/for/forstegangskjoper", label: "Førstegangskjøper" },
  { href: "/for/boliginvestor",     label: "Boliginvestor" },
  { href: "/kontakt",               label: "Kontakt" },
];

const CTA_HREF = "/#sok";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close tools dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
      scrolled
        ? "border-card-border bg-background/90 backdrop-blur-2xl shadow-lg shadow-black/20"
        : "border-transparent bg-transparent backdrop-blur-none"
    }`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {/* Logo pulse — migrated from CSS keyframe to motion in Package 5.
              Opacity oscillates subtly to signal a live product. */}
          <motion.div
            className="shrink-0"
            animate={{ opacity: [1, 0.85, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Logo className="h-8 w-8" />
          </motion.div>
          <span className="font-bold text-base xs:text-lg tracking-tight text-foreground">
            Verdikart
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 text-sm text-text-secondary sm:flex">
          {/* Verktøy dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className={`nav-link flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground ${toolsOpen ? "text-foreground" : ""}`}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
            >
              Verktøy
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>
            {toolsOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-xl border border-card-border bg-card-bg shadow-2xl z-50">
                <div className="p-1.5">
                  {toolLinks.map(({ href, label, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-background"
                    >
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-xs text-text-tertiary">{desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

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
          {/* Auth */}
          <AuthButton />
          {/* Primary CTA */}
          <Link
            href="/#sok"
            className="btn-base btn-primary ml-1 px-4 py-1.5 text-sm btn-glow"
          >
            Prøv nå →
          </Link>
        </div>

        {/* Mobile CTA */}
        <Link
          href={CTA_HREF}
          className="btn-base btn-primary mr-2 px-3 py-1.5 text-xs sm:hidden"
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
