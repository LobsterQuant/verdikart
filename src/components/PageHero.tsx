import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

/**
 * Shared page hero — consistent H1 sizing across all inner pages.
 * Use this instead of ad-hoc h1 tags to keep typography hierarchy uniform.
 */
export default function PageHero({ icon, eyebrow, title, subtitle, center = false }: Props) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {icon && (
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 ${center ? "mx-auto" : ""}`}>
          {icon}
        </div>
      )}
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
      )}
      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
