import { IconBase, IconProps, fillStyle } from "./Icon";

export function EiendomsskattIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M5 20 V10 L12 5 L19 10 V20 Z" />
      <path d="M3 11 L12 5 L21 11" />
      <path d="M5 20 V11 H19 V20" />
      <rect x={10} y={13} width={4} height={4} rx={0.5} />
      <path d="M3 20 H21" />
    </IconBase>
  );
}
