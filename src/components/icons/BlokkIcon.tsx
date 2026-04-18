import { IconBase, IconProps, fillStyle } from "./Icon";

export function BlokkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M5 21 V5 H19 V21 Z" />
      <path d="M5 21 V5 H19 V21" />
      <path d="M3 21 H21" />
      <rect x={7.5} y={8} width={2.5} height={2.5} />
      <rect x={14} y={8} width={2.5} height={2.5} />
      <rect x={7.5} y={12.5} width={2.5} height={2.5} />
      <rect x={14} y={12.5} width={2.5} height={2.5} />
      <path d="M10.5 21 V17 H13.5 V21" />
    </IconBase>
  );
}
