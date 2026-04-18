import { IconBase, IconProps, fillStyle } from "./Icon";

export function KollektivAvgangIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle style={fillStyle} cx={6} cy={12} r={2} />
      <circle style={fillStyle} cx={14} cy={12} r={2} />
      <path d="M3 12 C3 9 4 7 6 7 S9 9 9 12 8 17 6 17 3 15 3 12 Z" />
      <path d="M11 12 C11 9 12 7 14 7 S17 9 17 12 16 17 14 17 11 15 11 12 Z" />
      <path d="M20 9 V15" />
      <path d="M18 12 L22 12" />
    </IconBase>
  );
}
