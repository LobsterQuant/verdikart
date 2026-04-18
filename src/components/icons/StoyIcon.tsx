import { IconBase, IconProps, fillStyle } from "./Icon";

export function StoyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M4 9 H8 L12 5 V19 L8 15 H4 Z" />
      <path d="M4 9 H8 L12 5 V19 L8 15 H4 Z" />
      <path d="M15 9 Q17 12 15 15" />
      <path d="M18 6.5 Q21.5 12 18 17.5" />
    </IconBase>
  );
}
