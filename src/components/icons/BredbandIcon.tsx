import { IconBase, IconProps, fillStyle } from "./Icon";

export function BredbandIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle style={fillStyle} cx={12} cy={18} r={1.5} />
      <circle cx={12} cy={18} r={1.5} />
      <path d="M8 14 Q12 11 16 14" />
      <path d="M5 11 Q12 6 19 11" />
      <path d="M2 8 Q12 0 22 8" />
    </IconBase>
  );
}
