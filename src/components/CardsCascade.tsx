"use client";

// Replaced Framer Motion animation with CSS-only staggered fade-in.
// Framer's initial={{ opacity: 0 }} on server-rendered nodes causes React hydration error #418
// because the server outputs a different inline style than what the client produces on mount.
import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
  className?: string;
}

export default function CardsCascade({ children, className = "" }: Props) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className="animate-card-enter"
          style={{ animationDelay: `${Math.min(i, 6) * 70}ms`, animationFillMode: "both" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
