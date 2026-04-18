import { IconBase, IconProps, fillStyle } from "./Icon";

export function EneboligIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path style={fillStyle} d="M6 20 V10 L12 5 L18 10 V20 Z" />
      <path d="M4 11 L12 5 L20 11" />
      <path d="M6 20 V11 H18 V20" />
      <path d="M11 20 V15 H13 V20" />
      <path d="M8.5 13 H9.5 M14.5 13 H15.5" />
    </IconBase>
  );
}
