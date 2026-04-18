import { IconBase, IconProps, fillStyle } from "./Icon";

export function BoligIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M6 20 V9 L12 4 L18 9 V20 Z" />
      <path d="M4 11 L12 4 L20 11" />
      <path d="M6 20 V11 H18 V20" />
      <path d="M10 20 V15 H14 V20" />
    </IconBase>
  );
}
