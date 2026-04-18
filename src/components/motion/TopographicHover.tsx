"use client";

import { useRef, type CSSProperties, type ReactNode, type MouseEvent, type Ref } from "react";

type TopographicHoverProps = {
  children: ReactNode;
  className?: string;
  rings?: 3 | 5;
  as?: "div" | "article" | "section";
  style?: CSSProperties;
};

/**
 * Verdikart signature hover — concentric mint rings that ripple outward from
 * the cursor on hover, styled after NVE flood contours. The container sets
 * overflow/isolation; the SVG overlay owns the rings; cursor tracking flips
 * cx/cy via rAF-throttled setAttribute so the effect is GPU-cheap.
 *
 * Desktop-only: the CSS activation is gated on `(hover: hover) and
 * (pointer: fine)`, so touch devices and reduced-motion users see nothing.
 */
export function TopographicHover({
  children,
  className = "",
  rings = 5,
  as: Component = "div",
  style,
}: TopographicHoverProps) {
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (rafRef.current !== null) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 200;
      const y = ((clientY - rect.top) / rect.height) * 120;
      el.querySelectorAll<SVGCircleElement>("[data-topo-ring]").forEach((ring) => {
        ring.setAttribute("cx", String(x));
        ring.setAttribute("cy", String(y));
      });
    });
  };

  return (
    <Component
      ref={ref as Ref<HTMLDivElement>}
      className={`topo-hover-container ${className}`}
      onMouseMove={handleMouseMove}
      style={style}
    >
      <svg
        className="topo-hover-svg"
        viewBox="0 0 200 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: rings }, (_, i) => (
          <circle
            key={i}
            data-topo-ring=""
            className={`topo-hover-ring topo-hover-ring-${i + 1}`}
            cx="100"
            cy="60"
            r="18"
          />
        ))}
      </svg>
      <div className="topo-hover-content">{children}</div>
    </Component>
  );
}
