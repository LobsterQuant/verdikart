"use client";

// Framer Motion `initial` on a server-rendered wrapper causes React hydration error #418
// because the server outputs opacity:0 inline style but the client hydrates to opacity:1.
// Fix: use a CSS-only page-enter animation via a className — zero JS, no hydration mismatch.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}
