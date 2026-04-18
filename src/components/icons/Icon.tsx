import { SVGProps, ReactNode } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  label?: string;
};

export function IconBase({
  size = 24,
  label,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
      {...rest}
    >
      {children}
    </svg>
  );
}

// Duotone fill — paths that should render at 18% opacity with no stroke.
export const fillStyle = {
  fill: "currentColor",
  fillOpacity: 0.18,
  stroke: "none",
} as const;
