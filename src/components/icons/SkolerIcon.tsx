import { IconBase, IconProps, fillStyle } from "./Icon";

export function SkolerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M12 2 L22 8 V13 H2 V8 Z" />
      <path d="M2 8 L12 2 L22 8" />
      <path d="M2 13 H22" />
      <path d="M5 13 V19 M10 13 V19 M14 13 V19 M19 13 V19" />
      <path d="M3 22 H21" />
    </IconBase>
  );
}
