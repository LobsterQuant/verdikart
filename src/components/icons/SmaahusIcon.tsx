import { IconBase, IconProps, fillStyle } from "./Icon";

export function SmaahusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        style={fillStyle}
        d="M3 20 V12 L7 8.5 L11 12 V20 Z M11 20 V12 L15 8.5 L19 12 V20 Z"
      />
      <path d="M2 13 L7 8.5 L11 12.5 M11 12.5 L15 8.5 L19 12.5 L22 13" />
      <path d="M3 20 V12.5 H11 V20" />
      <path d="M11 20 V12.5 H19 V20" />
      <path d="M6 20 V16 H8 V20" />
      <path d="M14 20 V16 H16 V20" />
      <path d="M2 20 H22" />
    </IconBase>
  );
}
